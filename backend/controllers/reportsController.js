const mongoose = require('mongoose');
const Product = require('../models/Product');
const SalesOrder = require('../models/SalesOrder');
const Invoice = require('../models/CustomerInvoice');
const Payment = require('../models/Payment');
const VendorBill = require('../models/VendorBills');
const StockLedger = require('../models/StockLedger');

// Returns on-hand stock per product and overall summary
exports.getStockReport = async (req, res, next) => {
  try {
    // Aggregate stock in/out by product
    const stockAgg = await StockLedger.aggregate([
      {
        $group: {
          _id: '$product',
          inQty: {
            $sum: {
              $cond: [{ $eq: ['$type', 'In'] }, '$quantity', 0],
            },
          },
          outQty: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Out'] }, '$quantity', 0],
            },
          },
        },
      },
      {
        $addFields: {
          onHand: { $subtract: ['$inQty', '$outQty'] },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          productId: '$product._id',
          productName: '$product.name',
          onHand: 1,
          purchasePrice: '$product.purchasePrice',
          stockValue: { $multiply: ['$onHand', '$product.purchasePrice'] },
        },
      },
      { $sort: { productName: 1 } },
    ]);

    const totals = stockAgg.reduce(
      (acc, row) => {
        acc.totalQty += row.onHand;
        acc.totalValue += row.stockValue;
        return acc;
      },
      { totalQty: 0, totalValue: 0 }
    );

    res.json({ success: true, data: stockAgg, summary: totals });
  } catch (err) {
    next(err);
  }
};

// Helper: parse date range from query: support ?date=YYYY-MM-DD OR ?month=1-12&year=YYYY OR ?from=&to=
function parseDateRange(query) {
  let from = query.from ? new Date(query.from) : null;
  let to = query.to ? new Date(query.to) : null;
  if (query.date) {
    const d = new Date(query.date);
    if (!isNaN(d)) {
      from = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
      to = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
    }
  } else if (query.month || query.year) {
    const y = query.year ? parseInt(query.year, 10) : new Date().getFullYear();
    const m = (query.month ? parseInt(query.month, 10) : 1) - 1; // 0-based
    from = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0));
    to = new Date(end.getTime() - 1);
  }
  return { from, to };
}

// Returns Profit & Loss with Income and Expense grouped by CoA accounts and optional date filters
exports.getProfitAndLoss = async (req, res, next) => {
  try {
    const { from, to } = parseDateRange(req.query);
    const dateMatchInv = { status: 'confirmed' };
    const dateMatchBill = { status: 'confirmed' };
    if (from || to) {
      dateMatchInv.invoiceDate = {};
      if (from) dateMatchInv.invoiceDate.$gte = from;
      if (to) dateMatchInv.invoiceDate.$lte = to;
      dateMatchBill.invoiceDate = {};
      if (from) dateMatchBill.invoiceDate.$gte = from;
      if (to) dateMatchBill.invoiceDate.$lte = to;
    }

    // Income: from CustomerInvoice items whose CoA.type = 'Income'
    const incomeRows = await Invoice.aggregate([
      { $match: dateMatchInv },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'coas',
          localField: 'items.account',
          foreignField: '_id',
          as: 'acc',
        },
      },
      { $unwind: '$acc' },
      { $match: { 'acc.type': 'Income', 'acc.isActive': true } },
      {
        $group: {
          _id: '$acc.accountName',
          amount: { $sum: '$items.lineTotal' },
        },
      },
      { $project: { _id: 0, accountName: '$_id', amount: 1 } },
      { $sort: { accountName: 1 } },
    ]);

    // Expenses: from VendorBills items whose CoA.type = 'Expense'
    const expenseRows = await VendorBill.aggregate([
      { $match: dateMatchBill },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'coas',
          localField: 'items.account',
          foreignField: '_id',
          as: 'acc',
        },
      },
      { $unwind: '$acc' },
      { $match: { 'acc.type': 'Expense', 'acc.isActive': true } },
      {
        $group: {
          _id: '$acc.accountName',
          amount: { $sum: '$items.lineTotal' },
        },
      },
      { $project: { _id: 0, accountName: '$_id', amount: 1 } },
      { $sort: { accountName: 1 } },
    ]);

    const incomeTotal = incomeRows.reduce((s, r) => s + (r.amount || 0), 0);
    const expenseTotal = expenseRows.reduce((s, r) => s + (r.amount || 0), 0);
    const netProfit = incomeTotal - expenseTotal;

    if ((req.query.format || '').toLowerCase() === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=profit_and_loss.pdf');
      doc.pipe(res);

      doc.fontSize(16).text('Profit & Loss Report', { align: 'center' }).moveDown(0.5);
      if (from || to) {
        doc.fontSize(10).text(`Period: ${from ? new Date(from).toDateString() : ''} - ${to ? new Date(to).toDateString() : ''}`, { align: 'center' });
        doc.moveDown(0.5);
      }

      // Headers
      doc.fontSize(12).text('Expenses', 36).text('Amount', 220).text('Income', 320).text('Amount', 500).moveDown(0.25);

      const maxRows = Math.max(expenseRows.length, incomeRows.length);
      for (let i = 0; i < maxRows; i++) {
        const e = expenseRows[i];
        const inc = incomeRows[i];
        doc.fontSize(11)
          .text(e ? e.accountName : '', 36)
          .text(e ? e.amount.toFixed(2) : '', 220)
          .text(inc ? inc.accountName : '', 320)
          .text(inc ? inc.amount.toFixed(2) : '', 500);
      }

      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('blue').text('Net Profit', 36).fillColor('black').text(netProfit.toFixed(2), 220);
      doc.moveDown(0.25);
      doc.fontSize(12).text('Total', 36).text(expenseTotal.toFixed(2), 220).text('Total', 320).text(incomeTotal.toFixed(2), 500);

      doc.end();
      return;
    }

    res.json({
      success: true,
      data: {
        expenses: expenseRows,
        incomes: incomeRows,
        totals: { expenseTotal, incomeTotal, netProfit },
        period: { from, to },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Returns a balance sheet aligned to UI: Liabilities (Net Profit, Creditors A/c) vs Assets (Bank A/c, Cash A/c, Debtors A/c)
exports.getBalanceSheet = async (req, res, next) => {
  try {
    const { from, to } = parseDateRange(req.query);

    // Payments (use PaymentVoucher for consistency with ledger): signed sums by mode
    const payMatch = { status: 'confirmed' };
    if (from || to) {
      payMatch.paymentDate = {};
      if (from) payMatch.paymentDate.$gte = from;
      if (to) payMatch.paymentDate.$lte = to;
    }
    const payRows = await require('../models/PaymentVoucher').aggregate([
      { $match: payMatch },
      {
        $project: {
          mode: '$mode',
          signedAmount: {
            $multiply: [
              '$amount',
              { $cond: [{ $eq: ['$paymentType', 'Receive'] }, 1, -1] },
            ],
          },
        },
      },
      { $group: { _id: '$mode', total: { $sum: '$signedAmount' } } },
    ]);
    const bank = payRows.find(r => r._id === 'Bank')?.total || 0;
    const cash = payRows.find(r => r._id === 'Cash')?.total || 0;

    // Debtors A/c: outstanding from confirmed customer invoices in period
    const invMatch = { status: 'confirmed' };
    if (from || to) {
      invMatch.invoiceDate = {};
      if (from) invMatch.invoiceDate.$gte = from;
      if (to) invMatch.invoiceDate.$lte = to;
    }
    const debtorsAgg = await Invoice.aggregate([
      { $match: invMatch },
      { $group: { _id: null, total: { $sum: '$amountDue' } } },
    ]);
    const debtors = debtorsAgg[0]?.total || 0;

    // Creditors A/c: outstanding from confirmed vendor bills in period
    const billMatch = { status: 'confirmed' };
    if (from || to) {
      billMatch.invoiceDate = {};
      if (from) billMatch.invoiceDate.$gte = from;
      if (to) billMatch.invoiceDate.$lte = to;
    }
    const creditorsAgg = await VendorBill.aggregate([
      { $match: billMatch },
      { $group: { _id: null, total: { $sum: '$amountDue' } } },
    ]);
    const creditors = creditorsAgg[0]?.total || 0;

    // Net Profit for same period using the P&L pipeline above
    // Recompute quickly: incomeTotal - expenseTotal
    const { getProfitAndLoss } = module.exports;
    // If we had direct function call, we'd need a refactor. We'll recompute here similar to P&L aggregation.
    const incomeRows = await Invoice.aggregate([
      { $match: invMatch },
      { $unwind: '$items' },
      { $lookup: { from: 'coas', localField: 'items.account', foreignField: '_id', as: 'acc' } },
      { $unwind: '$acc' },
      { $match: { 'acc.type': 'Income', 'acc.isActive': true } },
      { $group: { _id: null, total: { $sum: '$items.lineTotal' } } },
    ]);
    const expenseRows = await VendorBill.aggregate([
      { $match: billMatch },
      { $unwind: '$items' },
      { $lookup: { from: 'coas', localField: 'items.account', foreignField: '_id', as: 'acc' } },
      { $unwind: '$acc' },
      { $match: { 'acc.type': 'Expense', 'acc.isActive': true } },
      { $group: { _id: null, total: { $sum: '$items.lineTotal' } } },
    ]);
    const incomeTotal = incomeRows[0]?.total || 0;
    const expenseTotal = expenseRows[0]?.total || 0;
    const netProfit = incomeTotal - expenseTotal;

    const assetsTotal = bank + cash + debtors;
    const liabilitiesTotal = creditors + netProfit;

    if ((req.query.format || '').toLowerCase() === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=balance_sheet.pdf');
      doc.pipe(res);

      doc.fontSize(16).text('Balance Sheet', { align: 'center' }).moveDown(0.5);
      if (from || to) {
        doc.fontSize(10).text(`As of: ${from ? new Date(from).toDateString() : ''} - ${to ? new Date(to).toDateString() : ''}`, { align: 'center' });
        doc.moveDown(0.5);
      }

      // Headers
      doc.fontSize(12).text('Liabilities', 36).text('Amount', 220).text('Assets', 320).text('Amount', 500).moveDown(0.25);

      const liabilitiesRows = [
        { name: 'Net Profit', amt: netProfit },
        { name: 'Creditors A/c', amt: creditors },
      ];
      const assetsRows = [
        { name: 'Bank A/c', amt: bank },
        { name: 'Cash A/c', amt: cash },
        { name: 'Debtors A/c', amt: debtors },
      ];
      const maxRows = Math.max(liabilitiesRows.length, assetsRows.length);
      for (let i = 0; i < maxRows; i++) {
        const l = liabilitiesRows[i];
        const a = assetsRows[i];
        doc.fontSize(11)
          .text(l ? l.name : '', 36)
          .text(l ? l.amt.toFixed(2) : '', 220)
          .text(a ? a.name : '', 320)
          .text(a ? a.amt.toFixed(2) : '', 500);
      }

      doc.moveDown(0.5);
      doc.fontSize(12).text('Total', 36).text(liabilitiesTotal.toFixed(2), 220).text('Total', 320).text(assetsTotal.toFixed(2), 500);
      doc.end();
      return;
    }

    res.json({
      success: true,
      data: {
        liabilities: { netProfit, creditors, total: liabilitiesTotal },
        assets: { bank, cash, debtors, total: assetsTotal },
        period: { from, to },
      },
      equation: 'Assets == Liabilities',
      check: Math.round((assetsTotal - liabilitiesTotal) * 100) / 100,
    });
  } catch (err) { next(err); }
};

const mongoose = require('mongoose');
const Product = require('../models/Product');
const SalesOrder = require('../models/SalesOrder');
const Invoice = require('../models/CustomerInvoice');
const Payment = require('../models/Payment');
const VendorBill = require('../models/VendorBills');
const StockLedger = require('../models/StockLedger');

// GET /api/reports/stock
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

// GET /api/reports/pl
// Returns Profit & Loss summary for all data (can be extended with date filters)
exports.getProfitAndLoss = async (req, res, next) => {
  try {
    // Sales Income: use customer invoices totalAmount (issued invoices)
    const salesAgg = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const salesIncome = salesAgg[0]?.total || 0;

    // Purchase Expenses: vendor bills totalAmount
    const purchaseAgg = await VendorBill.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const purchaseExpenses = purchaseAgg[0]?.total || 0;

    // Other Expenses: not modeled yet, keep 0 (placeholder for future)
    const otherExpenses = 0;

    const netProfit = salesIncome - purchaseExpenses - otherExpenses;

    res.json({
      success: true,
      data: {
        salesIncome,
        purchaseExpenses,
        otherExpenses,
        netProfit,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/balance-sheet
// Returns a simplified balance sheet snapshot
exports.getBalanceSheet = async (req, res, next) => {
  try {
    // Assets
    // Cash & Bank from payments collected
    const cashAgg = await Payment.aggregate([
      { $match: { paymentMode: 'Cash' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const bankAgg = await Payment.aggregate([
      { $match: { paymentMode: 'Bank' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const cash = cashAgg[0]?.total || 0;
    const bank = bankAgg[0]?.total || 0;

    // Stock value from stock report
    const stockRows = await StockLedger.aggregate([
      {
        $group: {
          _id: '$product',
          inQty: { $sum: { $cond: [{ $eq: ['$type', 'In'] }, '$quantity', 0] } },
          outQty: { $sum: { $cond: [{ $eq: ['$type', 'Out'] }, '$quantity', 0] } },
        },
      },
      { $addFields: { onHand: { $subtract: ['$inQty', '$outQty'] } } },
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
          value: { $multiply: ['$onHand', '$product.purchasePrice'] },
        },
      },
    ]);
    const stock = stockRows.reduce((acc, r) => acc + (r.value || 0), 0);

    // Liabilities
    // Vendor Payables: unpaid or partial vendor bills
    const vendorPayablesAgg = await VendorBill.aggregate([
      { $match: { paymentStatus: { $in: ['Unpaid', 'Partial'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const vendorPayables = vendorPayablesAgg[0]?.total || 0;

    const assets = cash + bank + stock;
    const liabilities = vendorPayables;
    const equity = assets - liabilities;

    res.json({
      success: true,
      data: {
        assets: { cash, bank, stock, total: assets },
        liabilities: { vendorPayables, total: liabilities },
        equity,
      },
      equation: 'Assets = Liabilities + Equity',
      check: Math.round((assets - (liabilities + equity)) * 100) / 100,
    });
  } catch (err) {
    next(err);
  }
};

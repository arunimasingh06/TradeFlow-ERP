const VendorBill = require('../models/VendorBills');
const Product = require('../models/Product');
const CoA = require('../models/CoA');
const Partner = require('../models/Partner');
const Counter = require('../models/Counter');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

async function getNextBillNumber() {
  const year = new Date().getFullYear();
  const key = `vb-${year}`;
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const seq = doc.seq || 1;
  return `Bill/${year}/${String(seq).padStart(4, '0')}`;
}

async function resolveDefaultAccount() {
  let acc = await CoA.findOne({ accountName: /Purchase Expense/i });
  if (!acc) acc = await CoA.findOne({ type: 'Expense' });
  return acc ? acc._id : null;
}

exports.listBills = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const status = req.query.status;
    const vendor = req.query.vendor;

    const filter = {};
    if (status) filter.status = status;
    if (vendor) filter.vendor = vendor;
    if (q) filter.billNumber = new RegExp(q, 'i');

    const [items, total] = await Promise.all([
      VendorBill.find(filter)
        .populate('vendor', 'name email')
        .populate('items.product', 'name hsnCode')
        .populate('items.account', 'accountName type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VendorBill.countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, items });
  } catch (err) { next(err); }
};


exports.getBill = async (req, res, next) => {
  try {
    const doc = await VendorBill.findById(req.params.id)
      .populate('vendor', 'name email')
      .populate('items.product', 'name hsnCode')
      .populate('items.account', 'accountName type');
    if (!doc) return res.status(404).json({ message: 'Vendor Bill not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};


exports.createBill = async (req, res, next) => {
  try {
    const vendorDoc = await Partner.findById(req.body.vendor);
    if (!vendorDoc) return res.status(400).json({ message: 'Invalid vendor' });

    // default account if missing
    const defaultAccountId = await resolveDefaultAccount();
    //Fill HSN from product and default account if missing
    if (Array.isArray(req.body.items)) {
      for (const line of req.body.items) {
        if (line.product) {
          const prod = await Product.findById(line.product).lean(); //.lean() returns a plain JavaScript object instead of a Mongoose document (faster and simpler for reading).
          if (prod) {
            if (!line.unitPrice && prod.purchasePrice != null) line.unitPrice = prod.purchasePrice;
            if (!line.hsnCode && prod.hsnCode) line.hsnCode = prod.hsnCode;
          }
        }
        if (!line.account && defaultAccountId) line.account = defaultAccountId;
      }
    }

    const billNumber = req.body.billNumber || await getNextBillNumber();

    const doc = await VendorBill.create({ ...req.body, billNumber });
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};


exports.updateBill = async (req, res, next) => {
  try {
    const bill = await VendorBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Vendor Bill not found' });
    if (bill.status !== 'draft') return res.status(400).json({ message: 'Only draft bill can be updated' });

    const defaultAccountId = await resolveDefaultAccount();
    if (Array.isArray(req.body.items)) {
      for (const line of req.body.items) {
        if (line.product) {
          const prod = await Product.findById(line.product).lean();
          if (prod) {
            if (line.unitPrice == null && prod.purchasePrice != null) line.unitPrice = prod.purchasePrice;
            if (!line.hsnCode && prod.hsnCode) line.hsnCode = prod.hsnCode;
          }
        }
        if (!line.account && defaultAccountId) line.account = defaultAccountId;
      }
    }

    Object.assign(bill, req.body);
    await bill.save();
    res.json({ success: true, item: bill });
  } catch (err) { next(err); }
};

// GET /api/vendor-bills/:id/print
exports.printBill = async (req, res, next) => {
  try {
    const bill = await VendorBill.findById(req.params.id)
      .populate('vendor', 'name email mobile')
      .populate('items.product', 'name hsnCode')
      .populate('items.account', 'accountName code type');
    if (!bill) return res.status(404).json({ message: 'Vendor Bill not found' });

    const items = bill.items.map(l => ({
      product: l.product,
      account: l.account,
      hsnCode: l.hsnCode,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate: l.taxRate || 0,
      lineUntaxed: l.lineUntaxed ?? (l.unitPrice * l.quantity),
      lineTax: l.lineTax ?? ((l.unitPrice * l.quantity * (l.taxRate || 0)) / 100),
      lineTotal: l.lineTotal ?? (l.unitPrice * l.quantity * (1 + (l.taxRate || 0)/100)),
    }));

    const payload = {
      billNumber: bill.billNumber,
      invoiceDate: bill.invoiceDate,
      dueDate: bill.dueDate,
      reference: bill.reference || null,
      status: bill.status,
      vendor: bill.vendor,
      items,
      totals: {
        untaxed: bill.totalUntaxedAmount,
        tax: bill.totalTaxAmount,
        total: bill.totalAmount,
      },
      payments: {
        paidCash: bill.paidCash || 0,
        paidBank: bill.paidBank || 0,
        amountDue: bill.amountDue || 0,
      }
    };
    if ((req.query.format || '').toLowerCase() === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${bill.billNumber}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(18).text('Vendor Bill', { align: 'center' }).moveDown(0.5);
      doc.fontSize(12)
        .text(`Bill No: ${payload.billNumber}`)
        .text(`Bill Date: ${new Date(payload.invoiceDate).toDateString()}`)
        .text(`Due Date: ${payload.dueDate ? new Date(payload.dueDate).toDateString() : '-'}`)
        .text(`Status: ${payload.status}`)
        .moveDown(0.5);

      // Vendor
      doc.fontSize(12).text('Vendor:', { underline: true });
      const vend = payload.vendor || {};
      doc.text(`Name: ${vend.name || ''}`)
         .text(`Email: ${vend.email || ''}`)
         .text(`Mobile: ${vend.mobile || ''}`)
         .moveDown(0.5);

      // Items
      doc.fontSize(12).text('Items:', { underline: true }).moveDown(0.25);
      payload.items.forEach((it, idx) => {
        const p = it.product || {};
        doc.moveDown(0.15)
          .text(`${idx + 1}. ${p.name || 'Item'} | HSN: ${it.hsnCode || ''}`)
          .text(`Qty: ${it.quantity}  Unit: ${it.unitPrice}  Tax%: ${it.taxRate}  Line Total: ${it.lineTotal.toFixed(2)}`);
      });

      // Totals
      doc.moveDown(0.75);
      doc.fontSize(12).text('Totals:', { underline: true });
      doc.text(`Untaxed: ${payload.totals.untaxed.toFixed(2)}`)
         .text(`Tax: ${payload.totals.tax.toFixed(2)}`)
         .text(`Total: ${payload.totals.total.toFixed(2)}`)
         .moveDown(0.5);

      // Payments
      doc.fontSize(12).text('Payments:', { underline: true });
      doc.text(`Paid Cash: ${payload.payments.paidCash.toFixed(2)}`)
         .text(`Paid Bank: ${payload.payments.paidBank.toFixed(2)}`)
         .text(`Amount Due: ${payload.payments.amountDue.toFixed(2)}`);

      doc.end();
      return;
    }
    res.json({ success: true, print: payload });
  } catch (err) { next(err); }
};


exports.confirmBill = async (req, res, next) => {
  try {
    const bill = await VendorBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Vendor Bill not found' });
    if (bill.status !== 'draft') return res.status(400).json({ message: 'Only draft bill can be confirmed' });
    bill.status = 'confirmed';
    await bill.save();
    res.json({ success: true, item: bill });
  } catch (err) { next(err); }
};


exports.cancelBill = async (req, res, next) => {
  try {
    const bill = await VendorBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Vendor Bill not found' });
    bill.status = 'cancelled';
    await bill.save();
    res.json({ success: true, item: bill });
  } catch (err) { next(err); }
};


exports.addPayment = async (req, res, next) => {
  try {
    const { mode, amount } = req.body; // mode: Cash|Bank
    if (!['Cash','Bank'].includes(mode)) return res.status(400).json({ message: 'Invalid mode' });
    const amt = Number(amount || 0);
    if (!(amt > 0)) return res.status(400).json({ message: 'Invalid amount' });

    const bill = await VendorBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Vendor Bill not found' });
    if (bill.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed bill can be paid' });

    if (mode === 'Cash') bill.paidCash += amt; else bill.paidBank += amt;
    await bill.save();
    res.json({ success: true, item: bill });
  } catch (err) { next(err); }
};

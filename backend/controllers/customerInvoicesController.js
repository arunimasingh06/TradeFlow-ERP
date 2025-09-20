const CustomerInvoice = require('../models/CustomerInvoice');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const CoA = require('../models/CoA');
const Counter = require('../models/Counter');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

async function getNextInvoiceNumber() {
  const year = new Date().getFullYear();
  const key = `ci-${year}`;
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const seq = doc.seq || 1;
  return `INV/${year}/${String(seq).padStart(4, '0')}`;
}

async function resolveDefaultIncomeAccount() {
  // Prefer a Sales Income A/c; otherwise any Income account
  let acc = await CoA.findOne({ accountName: /Sales Income/i });
  if (!acc) acc = await CoA.findOne({ type: 'Income' });
  return acc ? acc._id : null;
}

// GET /api/customer-invoices
exports.listInvoices = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const status = req.query.status;
    const customer = req.query.customer;

    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (q) filter.invoiceNumber = new RegExp(q, 'i');

    const [items, total] = await Promise.all([
      CustomerInvoice.find(filter)
        .populate('customer', 'name email')
        .populate('items.product', 'name hsnCode salesPrice')
        .populate('items.account', 'accountName type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CustomerInvoice.countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, items });
  } catch (err) { next(err); }
};


exports.printInvoice = async (req, res, next) => {
  try {
    const inv = await CustomerInvoice.findById(req.params.id)
      .populate('customer', 'name email mobile')
      .populate('items.product', 'name hsnCode salesPrice')
      .populate('items.account', 'accountName code type')
      .populate('salesOrder', 'soNumber');
    if (!inv) return res.status(404).json({ message: 'Customer Invoice not found' });

    const items = inv.items.map(l => ({
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
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      reference: inv.reference || null,
      status: inv.status,
      customer: inv.customer,
      salesOrder: inv.salesOrder,
      items,
      totals: {
        untaxed: inv.totalUntaxedAmount,
        tax: inv.totalTaxAmount,
        total: inv.totalAmount,
      },
      payments: {
        paidCash: inv.paidCash || 0,
        paidBank: inv.paidBank || 0,
        amountDue: inv.amountDue || 0,
      }
    };
    if ((req.query.format || '').toLowerCase() === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${inv.invoiceNumber}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(18).text('Customer Invoice', { align: 'center' }).moveDown(0.5);
      doc.fontSize(12)
        .text(`Invoice No: ${payload.invoiceNumber}`)
        .text(`Invoice Date: ${new Date(payload.invoiceDate).toDateString()}`)
        .text(`Due Date: ${payload.dueDate ? new Date(payload.dueDate).toDateString() : '-'}`)
        .text(`Status: ${payload.status}`)
        .moveDown(0.5);

      // Customer
      doc.fontSize(12).text('Customer:', { underline: true });
      const cust = payload.customer || {};
      doc.text(`Name: ${cust.name || ''}`)
        .text(`Email: ${cust.email || ''}`)
        .text(`Mobile: ${cust.mobile || ''}`)
        .moveDown(0.5);

      // Items
      doc.fontSize(12).text('Items:', { underline: true }).moveDown(0.25);
      doc.font('Helvetica-Bold').text('Product', 36).font('Helvetica');
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


exports.getInvoice = async (req, res, next) => {
  try {
    const doc = await CustomerInvoice.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('items.product', 'name hsnCode salesPrice')
      .populate('items.account', 'accountName type')
      .populate('salesOrder', 'soNumber');
    if (!doc) return res.status(404).json({ message: 'Customer Invoice not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};


exports.createInvoice = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.body.customer);
    if (!customer) return res.status(400).json({ message: 'Invalid customer' });

    const defaultIncomeAcc = await resolveDefaultIncomeAccount();
    if (Array.isArray(req.body.items)) {
      for (const line of req.body.items) {
        if (line.product) {
          const prod = await Product.findById(line.product).lean();
          if (prod) {
            if (line.unitPrice == null && prod.salesPrice != null) line.unitPrice = prod.salesPrice;
            if (!line.hsnCode && prod.hsnCode) line.hsnCode = prod.hsnCode;
          }
        }
        if (!line.account && defaultIncomeAcc) line.account = defaultIncomeAcc;
      }
    }

    const invoiceNumber = req.body.invoiceNumber || await getNextInvoiceNumber();
    const doc = await CustomerInvoice.create({ ...req.body, invoiceNumber });
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};


exports.updateInvoice = async (req, res, next) => {
  try {
    const inv = await CustomerInvoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Customer Invoice not found' });
    if (inv.status !== 'draft') return res.status(400).json({ message: 'Only draft invoice can be updated' });

    const defaultIncomeAcc = await resolveDefaultIncomeAccount();
    if (Array.isArray(req.body.items)) {
      for (const line of req.body.items) {
        if (line.product) {
          const prod = await Product.findById(line.product).lean();
          if (prod) {
            if (line.unitPrice == null && prod.salesPrice != null) line.unitPrice = prod.salesPrice;
            if (!line.hsnCode && prod.hsnCode) line.hsnCode = prod.hsnCode;
          }
        }
        if (!line.account && defaultIncomeAcc) line.account = defaultIncomeAcc;
      }
    }

    Object.assign(inv, req.body);
    await inv.save();
    res.json({ success: true, item: inv });
  } catch (err) { next(err); }
};


exports.confirmInvoice = async (req, res, next) => {
  try {
    const inv = await CustomerInvoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Customer Invoice not found' });
    if (inv.status !== 'draft') return res.status(400).json({ message: 'Only draft invoice can be confirmed' });
    inv.status = 'confirmed';
    await inv.save();
    res.json({ success: true, item: inv });
  } catch (err) { next(err); }
};


exports.cancelInvoice = async (req, res, next) => {
  try {
    const inv = await CustomerInvoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Customer Invoice not found' });
    if (inv.status === 'confirmed') {
      return res.status(400).json({ message: 'Confirmed invoices cannot be cancelled' });
    }
    inv.status = 'cancelled';
    await inv.save();
    res.json({ success: true, item: inv });
  } catch (err) { next(err); }
};


exports.addPayment = async (req, res, next) => {
  try {
    const { mode, amount } = req.body; // mode: Cash|Bank
    if (!['Cash','Bank'].includes(mode)) return res.status(400).json({ message: 'Invalid mode' });
    const amt = Number(amount || 0);
    if (!(amt > 0)) return res.status(400).json({ message: 'Invalid amount' });

    const inv = await CustomerInvoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Customer Invoice not found' });
    if (inv.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed invoice can be paid' });

    if (mode === 'Cash') inv.paidCash += amt; else inv.paidBank += amt;
    await inv.save();
    res.json({ success: true, item: inv });
  } catch (err) { next(err); }
};


exports.createFromSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findById(req.params.soId).populate('items.product', 'hsnCode salesPrice');
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    if (so.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed SO can be invoiced' });

    const defaultIncomeAcc = await resolveDefaultIncomeAccount();
    const items = so.items.map((line) => ({
      product: line.product?._id || line.product,
      hsnCode: line.product?.hsnCode || null,
      account: defaultIncomeAcc,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      taxRate: line.taxRate || 0,
    }));

    const invoiceNumber = await getNextInvoiceNumber();
    const invoiceDate = req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date();
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 30*24*60*60*1000); //Taken from request body, otherwise set to 30 days from now

    const inv = await CustomerInvoice.create({
      invoiceNumber,
      customer: so.customer,
      salesOrder: so._id,
      reference: req.body.reference || null,
      invoiceDate,
      dueDate,
      items,
      status: 'confirmed',
    });

    res.status(201).json({ success: true, item: inv });
  } catch (err) { next(err); }
};

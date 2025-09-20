const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Counter = require('../models/Counter');
const CustomerInvoice = require('../models/CustomerInvoice');
const CoA = require('../models/CoA');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// GET /api/sales-orders/:id/print
exports.printSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findById(req.params.id)
      .populate('customer', 'name email mobile')
      .populate('items.product', 'name hsnCode salesPrice');
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });

    const payload = {
      soNumber: so.soNumber,
      soDate: so.soDate,
      reference: so.reference || null,
      status: so.status,
      customer: so.customer,
      items: so.items.map(l => ({
        product: l.product,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
        lineUntaxed: l.unitPrice * l.quantity,
        lineTax: (l.unitPrice * l.quantity * (l.taxRate || 0)) / 100,
        lineTotal: l.unitPrice * l.quantity * (1 + (l.taxRate || 0)/100),
      })),
      totals: {
        untaxed: so.totalUntaxedAmount,
        tax: so.totalTaxAmount,
        total: so.totalAmount,
      },
    };
    res.json({ success: true, print: payload });
  } catch (err) { next(err); }
};

// POST /api/sales-orders/:id/create-invoice
exports.createInvoiceFromSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findById(req.params.id).populate('items.product', 'hsnCode salesPrice');
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    if (so.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed SO can be invoiced' });

    const defaultIncomeAcc = await resolveDefaultIncomeAccount();
    const items = so.items.map(line => ({
      product: line.product?._id || line.product,
      hsnCode: line.product?.hsnCode || null,
      account: defaultIncomeAcc,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      taxRate: line.taxRate || 0,
    }));

    const invoiceNumber = await getNextInvoiceNumber();
    const invoiceDate = req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date();
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 30*24*60*60*1000);

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

// Helpers for SO -> Invoice
async function resolveDefaultIncomeAccount() {
  let acc = await CoA.findOne({ accountName: /Sales Income/i });
  if (!acc) acc = await CoA.findOne({ type: 'Income' });
  return acc ? acc._id : null;
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

async function getNextSONumber() {
  const doc = await Counter.findOneAndUpdate(
    { key: 'so' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const seq = doc.seq || 1;
  return 'SO' + String(seq).padStart(5, '0');
}


exports.listSOs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const status = req.query.status;
    const customer = req.query.customer;

    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (q) filter.soNumber = new RegExp(q, 'i');

    const [items, total] = await Promise.all([
      SalesOrder.find(filter)
        .populate('customer', 'name email')
        .populate('items.product', 'name salesPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SalesOrder.countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, items });
  } catch (err) { next(err); }
};


exports.getSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('items.product', 'name salesPrice');
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    res.json({ success: true, item: so });
  } catch (err) { next(err); }
};


exports.createSO = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.body.customer);
    if (!customer) return res.status(400).json({ message: 'Invalid customer' });

    if (Array.isArray(req.body.items)) {
      for (const line of req.body.items) {
        if (line.product && (line.unitPrice === undefined || line.unitPrice === null)) {
          const prod = await Product.findById(line.product).lean();
          if (prod) line.unitPrice = prod.salesPrice || 0;
        }
      }
    }

    const soNumber = req.body.soNumber || await getNextSONumber();
    const payload = { ...req.body, soNumber };
    const so = await SalesOrder.create(payload);
    res.status(201).json({ success: true, item: so });
  } catch (err) { next(err); }
};


exports.updateSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findById(req.params.id);
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    if (so.status !== 'draft') return res.status(400).json({ message: 'Only draft SO can be updated' });

    if (Array.isArray(req.body.items)) {  //only runs if items is actually an array of line items.
      for (const line of req.body.items) {
        if (line.product && (line.unitPrice === undefined || line.unitPrice === null)) {
          const prod = await Product.findById(line.product).lean();  // fetch the product’s default sales price from the database.
          if (prod) line.unitPrice = prod.salesPrice || 0;
        }
      }
    }

    Object.assign(so, req.body); //copies all properties from req.body to the existing so(sales order). Updates things like customer, items, status
    await so.save();   
    res.json({ success: true, item: so });
  } catch (err) { next(err); }
};

exports.confirmSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findById(req.params.id);
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    if (so.status !== 'draft') return res.status(400).json({ message: 'Only draft SO can be confirmed' });
    so.status = 'confirmed';
    await so.save();
    res.json({ success: true, item: so });
  } catch (err) { next(err); }
};


exports.cancelSO = async (req, res, next) => {
  try {
    const so = await SalesOrder.findById(req.params.id);
    if (!so) return res.status(404).json({ message: 'Sales Order not found' });
    if (so.status === 'confirmed') {
      return res.status(400).json({ message: 'Confirmed Sales Orders cannot be cancelled' });
    }
    so.status = 'cancelled';
    await so.save();
    res.json({ success: true, item: so });
  } catch (err) { next(err); }
};

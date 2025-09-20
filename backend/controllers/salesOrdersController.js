const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Counter = require('../models/Counter');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
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

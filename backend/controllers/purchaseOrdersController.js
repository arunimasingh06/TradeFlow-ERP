const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Contact = require('../models/Customer');
const VendorBill = require('../models/VendorBills');
const Counter = require('../models/Counter');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

async function getNextPONumber() {
  const doc = await Counter.findOneAndUpdate(
    { key: 'po' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const seq = doc.seq || 1;
  // PO + 5-digit padded number: PO00001
  return 'PO' + String(seq).padStart(5, '0');
}

// List POs
exports.listPOs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const status = req.query.status; // draft | confirmed | cancelled | billed
    const vendor = req.query.vendor; // vendor id

    const filter = {};
    if (status) filter.status = status;
    if (vendor) filter.vendor = vendor;
    if (q) {
      filter.poNumber = new RegExp(q, 'i');
    }

    const [items, total] = await Promise.all([
      PurchaseOrder.find(filter)
        .populate('vendor', 'name email')
        .populate('items.product', 'name purchasePrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PurchaseOrder.countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, items });
  } catch (err) { next(err); }
};

// Get one PO
exports.getPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('vendor', 'name email')
      .populate('items.product', 'name purchasePrice');
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

// Create PO
exports.createPO = async (req, res, next) => {
  try {
    // ensure vendor exists and is vendor/both
    const vendor = await Contact.findById(req.body.vendor);
    if (!vendor) return res.status(400).json({ message: 'Invalid vendor' });

    // Default unitPrice from product if not provided
    if (Array.isArray(req.body.items)) {
      for (const line of req.body.items) {
        if (line.product && (line.unitPrice === undefined || line.unitPrice === null)) {
          const prod = await Product.findById(line.product).lean();
          if (prod) line.unitPrice = prod.purchasePrice || 0;
        }
      }
    }

    const poNumber = req.body.poNumber || await getNextPONumber();
    const payload = { ...req.body, poNumber };
    const po = await PurchaseOrder.create(payload);
    res.status(201).json({ success: true, item: po });
  } catch (err) { next(err); }
};

// Update PO (only when draft)
exports.updatePO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'draft') return res.status(400).json({ message: 'Only draft PO can be updated' });

    // If items updated and some unitPrice missing, backfill from product
    if (Array.isArray(req.body.items)) {
      for (const line of req.body.items) {
        if (line.product && (line.unitPrice === undefined || line.unitPrice === null)) {
          const prod = await Product.findById(line.product).lean();
          if (prod) line.unitPrice = prod.purchasePrice || 0;
        }
      }
    }

    Object.assign(po, req.body);
    await po.save();
    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

// Confirm PO
exports.confirmPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'draft') return res.status(400).json({ message: 'Only draft PO can be confirmed' });
    po.status = 'confirmed';
    await po.save();
    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

// Cancel PO
exports.cancelPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status === 'billed') return res.status(400).json({ message: 'Billed PO cannot be cancelled' });
    po.status = 'cancelled';
    await po.save();
    res.json({ success: true, item: po });
  } catch (err) { next(err); }
};

// Create Vendor Bill from PO
exports.createBillFromPO = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed PO can be billed' });

    const invoiceDate = req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date();
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : new Date(Date.now() + 30*24*60*60*1000);

    const bill = await VendorBill.create({
      purchaseOrder: po._id,
      vendor: po.vendor,
      invoiceDate,
      dueDate,
      totalAmount: po.totalAmount,
    });

    po.status = 'billed';
    await po.save();

    res.status(201).json({ success: true, billId: bill._id, bill });
  } catch (err) { next(err); }
};

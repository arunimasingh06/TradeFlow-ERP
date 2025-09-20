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

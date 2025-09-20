const PaymentVoucher = require('../models/PaymentVoucher');
const VendorBill = require('../models/VendorBills');
const Customer = require('../models/Customer');
const Partner = require('../models/Partner');
const Counter = require('../models/Counter');

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

async function getNextPaymentNumber() {
  const year = new Date().getFullYear();
  const key = `pay-${year}`;
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const seq = doc.seq || 1;  //Fallback to 1 just in case doc.seq is missing.
  return `Pay/${year}/${String(seq).padStart(4, '0')}`;  //padStart(4, '0') → ensures the number is always 4 digits (e.g., 1 → 0001, 42 → 0042)
}


exports.listPayments = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const q = (req.query.q || '').trim();
    const status = req.query.status; // draft|confirmed|cancelled
    const partner = req.query.partner;

    const filter = {};
    if (status) filter.status = status;
    if (partner) filter.partner = partner;
    if (q) filter.paymentNumber = new RegExp(q, 'i');

    const [items, total] = await Promise.all([
      PaymentVoucher.find(filter)
        .populate('partner', 'name email')
        .populate('vendorBill', 'billNumber totalAmount amountDue')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PaymentVoucher.countDocuments(filter),
    ]);

    res.json({ success: true, page, limit, total, items });
  } catch (err) { next(err); }
};


exports.getPayment = async (req, res, next) => {
  try {
    const doc = await PaymentVoucher.findById(req.params.id)
      .populate('partner', 'name email')
      .populate('vendorBill', 'billNumber totalAmount paidCash paidBank amountDue');
    if (!doc) return res.status(404).json({ message: 'Payment not found' });
    res.json({ success: true, item: doc });
  } catch (err) { next(err); }
};


exports.createPayment = async (req, res, next) => {
  try {
    const isVendor = (req.body.partnerType || 'Vendor') === 'Vendor';
    const partnerModel = isVendor ? 'Partner' : 'Customer';
    const partnerId = req.body.partner;
    const partnerDoc = isVendor ? await Partner.findById(partnerId) : await Customer.findById(partnerId);
    if (!partnerDoc) return res.status(400).json({ message: 'Invalid partner' });

    // If linked to a bill, default amount to amountDue when not specified
    let amount = req.body.amount;
    if (req.body.vendorBill && (amount === undefined || amount === null)) {
      const bill = await VendorBill.findById(req.body.vendorBill).lean();
      if (!bill) return res.status(400).json({ message: 'Linked bill not found' });
      amount = bill.amountDue;
    }

    const paymentNumber = req.body.paymentNumber || await getNextPaymentNumber();
    const payload = { ...req.body, paymentNumber, amount, partnerModel };
    const doc = await PaymentVoucher.create(payload);
    res.status(201).json({ success: true, item: doc });
  } catch (err) { next(err); }
};

// PUT /api/payments/:id (only draft)
exports.updatePayment = async (req, res, next) => {
  try {
    const pay = await PaymentVoucher.findById(req.params.id);
    if (!pay) return res.status(404).json({ message: 'Payment not found' });
    if (pay.status !== 'draft') return res.status(400).json({ message: 'Only draft payment can be updated' });

    // If partner changed, recompute partnerModel from partnerType
    if (req.body.partner) {
      const isVendor = (req.body.partnerType || pay.partnerType) === 'Vendor';
      req.body.partnerModel = isVendor ? 'Partner' : 'Customer';
      const partnerId = req.body.partner;
      const partnerDoc = isVendor ? await Partner.findById(partnerId) : await Customer.findById(partnerId);
      if (!partnerDoc) return res.status(400).json({ message: 'Invalid partner' });
    }

    // Prevent changing amount if linked to bill and would exceed due at confirm time — checked at confirm.
    Object.assign(pay, req.body);
    await pay.save();
    res.json({ success: true, item: pay });
  } catch (err) { next(err); }
};

// POST /api/payments/:id/confirm (apply to bill if linked)
exports.confirmPayment = async (req, res, next) => {
  try {
    const pay = await PaymentVoucher.findById(req.params.id);
    if (!pay) return res.status(404).json({ message: 'Payment not found' });
    if (pay.status !== 'draft') return res.status(400).json({ message: 'Only draft payment can be confirmed' });

    if (pay.vendorBill) {
      const bill = await VendorBill.findById(pay.vendorBill);
      if (!bill) return res.status(400).json({ message: 'Linked bill not found' });
      if (bill.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed bill can be paid' });

      // Ensure we don't overpay
      if (pay.amount > bill.amountDue + 1e-6) return res.status(400).json({ message: 'Payment exceeds amount due' });

      if (pay.mode === 'Cash') bill.paidCash += pay.amount; else bill.paidBank += pay.amount;
      await bill.save();
    }

    pay.status = 'confirmed';
    await pay.save();
    res.json({ success: true, item: pay });
  } catch (err) { next(err); }
};

// POST /api/payments/:id/cancel (reverse if previously confirmed)
exports.cancelPayment = async (req, res, next) => {
  try {
    const pay = await PaymentVoucher.findById(req.params.id);
    if (!pay) return res.status(404).json({ message: 'Payment not found' });

    if (pay.status === 'confirmed' && pay.vendorBill) {
      const bill = await VendorBill.findById(pay.vendorBill);
      if (bill) {
        if (pay.mode === 'Cash') bill.paidCash = Math.max(0, bill.paidCash - pay.amount);
        else bill.paidBank = Math.max(0, bill.paidBank - pay.amount);
        await bill.save();
      }
    }

    pay.status = 'cancelled';
    await pay.save();
    res.json({ success: true, item: pay });
  } catch (err) { next(err); }
};

const jwt = require('jsonwebtoken');
const CustomerInvoice = require('../models/CustomerInvoice');
const Customer = require('../models/Customer');
const PaymentIntent = require('../models/PaymentIntent');
const PaymentVoucher = require('../models/PaymentVoucher');
const Counter = require('../models/Counter');

async function getNextPaymentNumber() {
  const year = new Date().getFullYear();
  const key = `pv-${year}`;
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const seq = doc.seq || 1;
  return `Pay/${year}/${String(seq).padStart(4, '0')}`;
}

exports.listMyInvoices = async (req, res, next) => {
  try {
    const customerId = req.portal.customerId;
    const invoices = await CustomerInvoice.find({ customer: customerId })
      .select('invoiceNumber invoiceDate dueDate amountDue totalAmount status')
      .sort({ invoiceDate: -1 })
      .lean();

    res.json({ success: true, items: invoices });
  } catch (err) { next(err); }
};

exports.createPortalToken = async (req, res, next) => {
  try {
    const { customerId } = req.body;
    const customer = await Customer.findById(customerId).select('_id name');
    if (!customer) return res.status(400).json({ message: 'Invalid customer' });
    const token = jwt.sign({ sub: String(customer._id), purpose: 'portal' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) { next(err); }
};

exports.createPaymentIntent = async (req, res, next) => {
  try {
    const customerId = req.portal.customerId;
    const inv = await CustomerInvoice.findOne({ _id: req.params.id, customer: customerId, status: 'confirmed' });
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    if ((inv.amountDue || 0) <= 0) return res.status(400).json({ message: 'Invoice already paid' });

    // mock client secret for demo payment
    const clientSecret = `pi_${inv._id}_${Date.now()}`;
    const intent = await PaymentIntent.create({
      invoice: inv._id,
      customer: customerId,
      amount: Math.round(inv.amountDue * 100) / 100,
      currency: 'INR',
      provider: 'mock',
      status: 'requires_confirmation',
      clientSecret,
    });

    res.status(201).json({ success: true, intent: { id: intent._id, clientSecret: intent.clientSecret, amount: intent.amount, currency: intent.currency } });
  } catch (err) { next(err); }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const customerId = req.portal.customerId;
    const { clientSecret, mode } = req.body; // mode: 'Bank'|'Cash' (default Bank)

    const intent = await PaymentIntent.findOne({ clientSecret }).populate('invoice');
    if (!intent) return res.status(404).json({ message: 'Payment intent not found' });
    if (String(intent.customer) !== String(customerId)) return res.status(403).json({ message: 'Not authorized' });
    if (intent.status === 'succeeded') return res.status(400).json({ message: 'Payment already captured' });

    // mark intent
    intent.status = 'succeeded';
    await intent.save();

    // register PaymentVoucher as Receive from Customer to Bank/Cash
    const paymentNumber = await getNextPaymentNumber();
    const voucher = await PaymentVoucher.create({
      paymentNumber,
      paymentType: 'Receive',
      partnerType: 'Customer',
      partnerModel: 'Customer',
      partner: intent.customer,
      customerInvoice: intent.invoice._id,
      paymentDate: new Date(),
      mode: ['Cash','Bank'].includes(mode) ? mode : 'Bank',
      amount: intent.amount,
      note: `Portal payment for invoice ${intent.invoice.invoiceNumber}`,
      status: 'confirmed',
    });

    // update invoice paid amounts
    const inv = intent.invoice;
    if (voucher.mode === 'Cash') inv.paidCash += intent.amount; else inv.paidBank += intent.amount;
    await inv.save();

    res.json({ success: true, voucherId: voucher._id, invoiceId: inv._id, amount: intent.amount });
  } catch (err) { next(err); }
};

const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerInvoice', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'INR' },
  provider: { type: String, default: 'mock' },
  status: {
    type: String,
    enum: ['requires_payment_method', 'requires_confirmation', 'succeeded', 'canceled'],
    default: 'requires_payment_method'
  },
  clientSecret: { type: String, required: true },
}, { timestamps: true });

paymentIntentSchema.index({ invoice: 1, status: 1 });

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);

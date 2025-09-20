const mongoose = require('mongoose');

const paymentVoucherSchema = new mongoose.Schema({
  paymentNumber: { type: String, required: true, unique: true }, // Pay/2025/0001

  paymentType: { type: String, enum: ['Send','Receive'], required: true, default: 'Send' },
  partnerType: { type: String, enum: ['Customer','Vendor'], required: true, default: 'Vendor' },
  partnerModel: { type: String, enum: ['Customer','Partner'], required: true, default: 'Partner' },
  partner: { type: mongoose.Schema.Types.ObjectId, refPath: 'partnerModel', required: true },

  // Link to bill/invoice (optional)
  vendorBill: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorBill', default: null },
  // Future: sales invoice can be added here

  paymentDate: { type: Date, default: Date.now },
  mode: { type: String, enum: ['Cash','Bank'], default: 'Bank' },
  amount: { type: Number, required: true, min: 0 },
  note: { type: String, default: null },

  status: { type: String, enum: ['draft','confirmed','cancelled'], default: 'draft' },
}, { timestamps: true });

module.exports = mongoose.model('PaymentVoucher', paymentVoucherSchema);

const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  mobile: { type: String },
  gstNo: { type: String },
  address: {
    city: String,
    state: String,
    pincode: String,
  },
  isActive: { type: Boolean, default: true },
  archivedAt: { type: Date, default: null },
}, { timestamps: true });

partnerSchema.index({ name: 1 });
partnerSchema.index({ email: 1 });
partnerSchema.index({ isActive: 1 });

module.exports = mongoose.model('Partner', partnerSchema);

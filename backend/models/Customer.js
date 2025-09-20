
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true },
    
  type: { 
    type: String,           
    enum: ["Customer", "Vendor", "Both"],
    required: true 
},
  email: { 
    type: String, 
    required: true, 
    unique: true 
},
  mobile: {                 
    type: String 
},
  address: {
    city: String,
    state: String,
    pincode: String,
  },
  profileImage: { 
    type: String 
}, 
  // Master data management
  isActive: { type: Boolean, default: true },
  archivedAt: { type: Date, default: null }
}, { timestamps: true });

// Indexes for faster list/search
contactSchema.index({ name: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model("Contact", contactSchema);

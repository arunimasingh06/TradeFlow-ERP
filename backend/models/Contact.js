
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
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);

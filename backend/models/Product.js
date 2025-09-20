
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
  type: {
     type: String, 
     enum: ["Goods", "Service"],
     required: true 
    },
  salesPrice: { 
    type: Number, 
    required: true 
    },
  purchasePrice: { 
    type: Number, 
    required: true 
    },
  salesTax: { 
    type: Number, 
    default: 0 
    },
  purchaseTax: { 
    type: Number, 
    default: 0 
    },
  hsnCode: { 
    type: String 
    },
  category: {           
    type: String 
    },
  // Master data management
  isActive: { type: Boolean, default: true },
  archivedAt: { type: Date, default: null }
}, { timestamps: true });

// Indexes for faster list/search
productSchema.index({ name: 1 });
productSchema.index({ type: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model("Product", productSchema);

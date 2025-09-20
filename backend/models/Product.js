
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
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);

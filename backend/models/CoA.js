const mongoose = require("mongoose");

const coaSchema = new mongoose.Schema({
  accountName: { 
    type: String, 
    required: true,
    unique: true 
    },

  type: { 
    type: String, 
    enum: ["Asset", "Liability", "Expense", "Income", "Equity"], 
    required: true 
    },

  description: { 
    type: String 
    },
}, 

{ 
    timestamps: true 
});

module.exports = mongoose.model("CoA", coaSchema);

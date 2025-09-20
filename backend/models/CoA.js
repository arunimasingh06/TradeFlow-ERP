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
  // Master data management
  isActive: { type: Boolean, default: true },
  archivedAt: { type: Date, default: null }
}, 

{ 
    timestamps: true 
});

// Indexes
coaSchema.index({ accountName: 1 });
coaSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model("CoA", coaSchema);

const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true 
    }, // e.g., GST 5%

  method: { 
    type: String,
    enum: ["Percentage", "Fixed"],
     required: true 
    },

  value: { 
    type: Number,
    required: true 
    }, // 5 = 5%

  applicableOn: { 
    type: String,
    enum: ["Sales", "Purchase", "Both"],
    required: true 
    },

  // Master data management
  isActive: { type: Boolean, default: true },
  archivedAt: { type: Date, default: null }

},

 { 
    timestamps: true
 });

// Indexes for search/list
taxSchema.index({ name: 1 });
taxSchema.index({ applicableOn: 1, isActive: 1 });

module.exports = mongoose.model("Tax", taxSchema);

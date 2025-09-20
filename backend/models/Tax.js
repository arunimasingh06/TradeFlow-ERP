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
    }

},

 { 
    timestamps: true
 });

module.exports = mongoose.model("Tax", taxSchema);

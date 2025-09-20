const mongoose = require("mongoose");

const stockLedgerSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    type: {
      type: String,
      enum: ["In", "Out"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    reference: {
      type: String, // e.g., PO/Invoice number
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockLedger", stockLedgerSchema);

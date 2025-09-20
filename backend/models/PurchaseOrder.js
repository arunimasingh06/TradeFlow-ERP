const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
    },
    poDate: {
      type: Date,
      default: Date.now,
    },
    reference: {
      type: String,
      default: null,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        taxRate: { // percentage, e.g., 5 for 5%
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    status: {
      type: String,
      enum: ["draft", "confirmed", "cancelled", "billed"],
      default: "draft",
    },

    totalUntaxedAmount: { type: Number, default: 0 },
    totalTaxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Calculate totals before save
purchaseOrderSchema.pre("save", async function (next) {
  let untaxed = 0;
  let tax = 0;
  for (const item of this.items) {
    const lineUntaxed = item.unitPrice * item.quantity;
    const lineTax = (lineUntaxed * (item.taxRate || 0)) / 100;
    untaxed += lineUntaxed;
    tax += lineTax;
  }
  this.totalUntaxedAmount = untaxed;
  this.totalTaxAmount = tax;
  this.totalAmount = untaxed + tax;
  next();
});

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);

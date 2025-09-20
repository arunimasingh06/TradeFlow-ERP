const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
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
        tax: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tax",
        },
      },
    ],

    status: {
      type: String,
      enum: ["Draft", "Ordered", "Received"],
      default: "Draft",
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    expectedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Pre-save hook to auto-calculate totalAmount including tax
purchaseOrderSchema.pre("save", async function (next) {
  const Tax = mongoose.model("Tax");
  let total = 0;

  for (const item of this.items) {
    let taxAmount = 0;

    if (item.tax) {
      const taxDoc = await Tax.findById(item.tax).lean();
      if (taxDoc) {
        taxAmount = (item.unitPrice * item.quantity * taxDoc.percentage) / 100;
      }
    }

    total += item.unitPrice * item.quantity + taxAmount;
  }

  this.totalAmount = total;
  next();
});

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);

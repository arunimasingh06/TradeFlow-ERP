const mongoose = require("mongoose");

const salesOrderSchema = new mongoose.Schema(
  {
    customer: {
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
        tax: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tax",
        },
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Invoiced", "Paid"],
      default: "Draft",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save hook to auto-calculate totalAmount
salesOrderSchema.pre("save", async function (next) {
  const Tax = mongoose.model("Tax");
  this.totalAmount = await this.items.reduce(async (accPromise, item) => {
    const acc = await accPromise;
    let taxAmount = 0;

    if (item.tax) {
      const taxDoc = await Tax.findById(item.tax).lean();
      if (taxDoc) taxAmount = (item.unitPrice * item.quantity * taxDoc.percentage) / 100;
    }

    return acc + item.unitPrice * item.quantity + taxAmount;
  }, Promise.resolve(0));

  next();
});

module.exports = mongoose.model("SalesOrder", salesOrderSchema);

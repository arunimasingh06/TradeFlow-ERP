const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true }, // INV/2025/0001
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', default: null },
    reference: { type: String, default: null },

    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },

    status: { type: String, enum: ['draft', 'confirmed', 'cancelled'], default: 'draft' },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        hsnCode: { type: String, default: null },
        account: { type: mongoose.Schema.Types.ObjectId, ref: 'CoA', required: true }, // Sales Income A/c
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        taxRate: { type: Number, default: 0, min: 0 },
        lineUntaxed: { type: Number, default: 0 },
        lineTax: { type: Number, default: 0 },
        lineTotal: { type: Number, default: 0 },
      },
    ],

    totalUntaxedAmount: { type: Number, default: 0 },
    totalTaxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    paidCash: { type: Number, default: 0 },
    paidBank: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

invoiceSchema.pre('save', function(next) {
  let untaxed = 0;
  let tax = 0;
  for (const item of this.items) {
    const lineUntaxed = (item.unitPrice || 0) * (item.quantity || 0);
    const lineTax = (lineUntaxed * (item.taxRate || 0)) / 100;
    item.lineUntaxed = lineUntaxed;
    item.lineTax = lineTax;
    item.lineTotal = lineUntaxed + lineTax;
    untaxed += lineUntaxed;
    tax += lineTax;
  }
  this.totalUntaxedAmount = untaxed;
  this.totalTaxAmount = tax;
  this.totalAmount = untaxed + tax;
  const paid = (this.paidCash || 0) + (this.paidBank || 0);
  this.amountDue = Math.max(this.totalAmount - paid, 0);
  next();
});

module.exports = mongoose.model('CustomerInvoice', invoiceSchema);

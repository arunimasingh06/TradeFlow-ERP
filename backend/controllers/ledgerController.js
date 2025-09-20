const Partner = require('../models/Partner');
const Customer = require('../models/Customer');
const VendorBill = require('../models/VendorBills');
const CustomerInvoice = require('../models/CustomerInvoice');
const PaymentVoucher = require('../models/PaymentVoucher');

function parseDateFilter(query) {
  // parseDateFilter takes query parameters like from,to,month,year.
  let from = query.from ? new Date(query.from) : null;
  let to = query.to ? new Date(query.to) : null;
  const month = query.month ? parseInt(query.month, 10) : null; // 1-12
  const year = query.year ? parseInt(query.year, 10) : null;
  if (!from && !to && (month || year)) {
    const y = year || new Date().getFullYear();
    const m = (month || 1) - 1;
    from = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0));
    to = new Date(end.getTime() - 1);
  }
  return { from, to };
}

function withinRange(date, from, to) {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function runningBalance(rows) {
  let bal = 0;
  return rows.map(r => ({ ...r, balance: (bal += r.amount) }));
}

exports.getPartnerLedger = async (req, res, next) => {
  try {
    const { from, to } = parseDateFilter(req.query);
    const q = (req.query.q || '').trim().toLowerCase();
    const partnerId = req.query.partner; // may be a Partner (vendor) or a Customer id

    // Load entities
    const [partners, customers] = await Promise.all([
      Partner.find(partnerId ? { _id: partnerId } : {}).select('name').lean(),
      Customer.find(partnerId ? { _id: partnerId } : {}).select('name').lean(),
    ]);

    // Map IDs to names and type
    const partnerMap = new Map(partners.map(p => [String(p._id), { name: p.name, type: 'Vendor' }]));
    const customerMap = new Map(customers.map(c => [String(c._id), { name: c.name, type: 'Customer' }]));

    // Queries
    const vbQ = { status: 'confirmed' };
    if (partnerId) vbQ.vendor = partnerId;
    const invQ = { status: 'confirmed' };
    if (partnerId) invQ.customer = partnerId;
    const payQ = { status: 'confirmed' };
    if (partnerId) payQ.partner = partnerId;

    const [bills, invoices, payments] = await Promise.all([
      VendorBill.find(vbQ).select('billNumber vendor invoiceDate dueDate totalAmount').lean(),
      CustomerInvoice.find(invQ).select('invoiceNumber customer invoiceDate dueDate totalAmount').lean(),
      PaymentVoucher.find(payQ).select('paymentNumber paymentType partnerType partner paymentDate mode amount').lean(),
    ]);

    const rows = [];

    // Vendor bills → Creditor A/c increase (positive)
    for (const b of bills) {
      if (from || to) {
        if (!withinRange(new Date(b.invoiceDate), from, to)) continue;
      }
      const pid = String(b.vendor);
      const pinfo = partnerMap.get(pid) || { name: 'Vendor', type: 'Vendor' };
      const partnerName = pinfo.name;
      const accName = 'Creditor A/c';
      const ref = b.billNumber;
      const date = b.invoiceDate;
      const due = b.dueDate;
      const amount = Number(b.totalAmount || 0); // +ve
      if (q && !(partnerName.toLowerCase().includes(q) || ref.toLowerCase().includes(q))) continue;
      rows.push({ partnerId: pid, partnerName, accountName: accName, refNumber: ref, date, dueDate: due, amount });
    }

    // Customer invoices → Debtors A/c increase (positive)
    for (const inv of invoices) {
      if (from || to) {
        if (!withinRange(new Date(inv.invoiceDate), from, to)) continue;
      }
      const pid = String(inv.customer);
      const cinfo = customerMap.get(pid) || { name: 'Customer', type: 'Customer' };
      const partnerName = cinfo.name;
      const accName = 'Debtors A/c';
      const ref = inv.invoiceNumber;
      const date = inv.invoiceDate;
      const due = inv.dueDate;
      const amount = Number(inv.totalAmount || 0); // +ve
      if (q && !(partnerName.toLowerCase().includes(q) || ref.toLowerCase().includes(q))) continue;
      rows.push({ partnerId: pid, partnerName, accountName: accName, refNumber: ref, date, dueDate: due, amount });
    }

    // Payments
    for (const p of payments) {
      if (from || to) {
        if (!withinRange(new Date(p.paymentDate), from, to)) continue;
      }
      const pid = String(p.partner);
      const isVendor = (p.partnerType || 'Vendor') === 'Vendor';
      const info = isVendor ? (partnerMap.get(pid) || { name: 'Vendor' }) : (customerMap.get(pid) || { name: 'Customer' });
      const partnerName = info.name;
      const accName = isVendor ? 'Creditor A/c' : 'Debtors A/c';
      const ref = p.paymentNumber || 'PAY';
      const date = p.paymentDate;
      const due = null;
      // For vendors, Send reduces liability (negative). For customers, Receive reduces receivable (negative).
      const sent = (p.paymentType || 'Send') === 'Send';
      const amount = isVendor ? (sent ? -Number(p.amount || 0) : Number(p.amount || 0))
                              : (!sent ? -Number(p.amount || 0) : Number(p.amount || 0));
      if (q && !(partnerName.toLowerCase().includes(q) || ref.toLowerCase().includes(q))) continue;
      rows.push({ partnerId: pid, partnerName, accountName: accName, refNumber: ref, date, dueDate: due, amount });
    }

    // Sort by date then ref
    rows.sort((a, b) => new Date(a.date) - new Date(b.date) || String(a.refNumber).localeCompare(String(b.refNumber)));

    // If a single partner filter, compute running balance like the UI
    let output = rows;
    if (partnerId) {
      output = runningBalance(rows);
    }

    if ((req.query.format || '').toLowerCase() === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 26 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=partner_ledger.pdf');
      doc.pipe(res);

      doc.fontSize(16).text('Partner Ledger', { align: 'center' }).moveDown(0.5);
      if (from || to) {
        doc.fontSize(10).text(`Period: ${from ? from.toDateString() : ''} - ${to ? to.toDateString() : ''}`);
      }
      if (partnerId) {
        const info = partnerMap.get(partnerId) || customerMap.get(partnerId) || { name: '' };
        doc.fontSize(10).text(`Partner: ${info.name}`);
      }
      doc.moveDown(0.5);

      // Table header
      doc.fontSize(11).text('Partner', 26)
        .text('Account', 180)
        .text('Ref No.', 300)
        .text('Date', 420)
        .text('Amount', 500)
        .moveDown(0.25);

      output.forEach(r => {
        doc.fontSize(10)
          .text(r.partnerName, 26)
          .text(r.accountName, 180)
          .text(r.refNumber, 300)
          .text(new Date(r.date).toLocaleDateString(), 420)
          .text((r.amount).toFixed(2), 500);
        if (r.balance !== undefined) {
          doc.text(`Bal: ${r.balance.toFixed(2)}`, 500, doc.y);
        }
      });

      doc.end();
      return;
    }

    res.json({ success: true, items: output, count: output.length });
  } catch (err) { next(err); }
};

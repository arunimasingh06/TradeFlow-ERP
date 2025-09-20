const express = require('express');
const router = express.Router();
const { requirePortalAuth } = require('../middlewares/portalAuth');
const { listMyInvoices, createPaymentIntent, confirmPayment, createPortalToken } = require('../controllers/portalController');

// Public: create a short-lived portal token for a known customer (admin-side call)
router.post('/token', createPortalToken);

// Customer portal protected routes
router.use(requirePortalAuth);

// List only this customer's invoices
router.get('/invoices', listMyInvoices);

// Create a payment intent for a specific invoice
router.post('/invoices/:id/payment-intents', createPaymentIntent);

// Confirm payment with clientSecret
router.post('/payments/confirm', confirmPayment);

module.exports = router;

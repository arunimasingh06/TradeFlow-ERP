const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth, requireRole } = require('../middlewares/jwtAuth');
const {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  confirmInvoice,
  cancelInvoice,
  addPayment,
  createFromSO,
} = require('../controllers/customerInvoicesController');

router.use(requireAuth);

// List / Read
router.get('/', listInvoices);
router.get('/:id', getInvoice);

// Create invoice (manual)
router.post(
  '/',
  [
    body('customer').notEmpty().withMessage('customer is required'),
    body('invoiceDate').optional().isISO8601().toDate(),
    body('dueDate').optional().isISO8601().toDate(),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.product').notEmpty().withMessage('product is required'),
    body('items.*.quantity').isFloat({ gt: 0 }).withMessage('quantity must be > 0'),
    body('items.*.unitPrice').isFloat({ gte: 0 }).withMessage('unitPrice must be >= 0'),
    body('items.*.taxRate').optional().isFloat({ gte: 0 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return createInvoice(req, res, next);
  }
);

// Create from SO (confirmed)
router.post(
  '/from-so/:soId',
  [
    body('invoiceDate').optional().isISO8601().toDate(),
    body('dueDate').optional().isISO8601().toDate(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return createFromSO(req, res, next);
  }
);

// Update (only draft)
router.put(
  '/:id',
  [
    body('customer').optional().notEmpty(),
    body('invoiceDate').optional().isISO8601().toDate(),
    body('dueDate').optional().isISO8601().toDate(),
    body('items').optional().isArray({ min: 1 }),
    body('items.*.product').optional().notEmpty(),
    body('items.*.quantity').optional().isFloat({ gt: 0 }),
    body('items.*.unitPrice').optional().isFloat({ gte: 0 }),
    body('items.*.taxRate').optional().isFloat({ gte: 0 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return updateInvoice(req, res, next);
  }
);

// Status and payments (admin)
router.post('/:id/confirm', requireRole('admin'), confirmInvoice);
router.post('/:id/cancel', requireRole('admin'), cancelInvoice);
router.post('/:id/pay', requireRole('admin'), addPayment);

module.exports = router;

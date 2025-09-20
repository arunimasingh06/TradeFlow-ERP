const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth, requireRole } = require('../middlewares/jwtAuth');
const {
  listSOs,
  getSO,
  createSO,
  updateSO,
  confirmSO,
  cancelSO,
} = require('../controllers/salesOrdersController');

router.use(requireAuth);

// List / Read
router.get('/', listSOs);
router.get('/:id', getSO);

// Create
router.post(
  '/',
  [
    body('customer').notEmpty().withMessage('customer is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.product').notEmpty().withMessage('product is required'),
    body('items.*.quantity').isFloat({ gt: 0 }).withMessage('quantity must be > 0'),
    body('items.*.unitPrice').isFloat({ gte: 0 }).withMessage('unitPrice must be >= 0'),
    body('items.*.taxRate').optional().isFloat({ gte: 0 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return createSO(req, res, next);
  }
);

// Update (only draft)
router.put(
  '/:id',
  [
    body('customer').optional().notEmpty(),
    body('items').optional().isArray({ min: 1 }),
    body('items.*.product').optional().notEmpty(),
    body('items.*.quantity').optional().isFloat({ gt: 0 }),
    body('items.*.unitPrice').optional().isFloat({ gte: 0 }),
    body('items.*.taxRate').optional().isFloat({ gte: 0 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return updateSO(req, res, next);
  }
);

// Status transitions (admin)
router.post('/:id/confirm', requireRole('admin'), confirmSO);
router.post('/:id/cancel', requireRole('admin'), cancelSO);

module.exports = router;

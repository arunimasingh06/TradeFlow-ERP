const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireAuth, requireRole } = require('../middlewares/jwtAuth');
const {
  listPayments,
  getPayment,
  createPayment,
  updatePayment,
  confirmPayment,
  cancelPayment,
} = require('../controllers/paymentsController');

router.use(requireAuth);

router.get('/', listPayments);
router.get('/:id', getPayment);

router.post(
  '/',
  [
    body('paymentType').optional().isIn(['Send','Receive']),
    body('partnerType').optional().isIn(['Customer','Vendor']),
    body('partner').notEmpty().withMessage('partner is required'),
    body('mode').optional().isIn(['Cash','Bank']),
    body('amount').optional().isFloat({ gt: 0 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return createPayment(req, res, next);
  }
);

router.put(
  '/:id',
  [
    body('paymentType').optional().isIn(['Send','Receive']),
    body('partnerType').optional().isIn(['Customer','Vendor']),
    body('partner').optional().notEmpty(),
    body('mode').optional().isIn(['Cash','Bank']),
    body('amount').optional().isFloat({ gt: 0 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return updatePayment(req, res, next);
  }
);

router.post('/:id/confirm', requireRole('admin'), confirmPayment);
router.post('/:id/cancel', requireRole('admin'), cancelPayment);

module.exports = router;

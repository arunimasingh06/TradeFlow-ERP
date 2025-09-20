const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/jwtAuth');
const {
  listTaxes,
  getTax,
  createTax,
  updateTax,
  archiveTax,
  unarchiveTax,
} = require('../controllers/taxesController');

// Protect all master routes
router.use(requireAuth);

router.get('/', listTaxes);
router.get('/:id', getTax);
router.post('/', createTax);
router.put('/:id', updateTax);
router.patch('/:id/archive', archiveTax);
router.patch('/:id/unarchive', unarchiveTax);

module.exports = router;

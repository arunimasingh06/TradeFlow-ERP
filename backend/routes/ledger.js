const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/jwtAuth');
const { getPartnerLedger } = require('../controllers/ledgerController');

router.use(requireAuth);

// Partner ledger with optional filters: ?partner=&from=&to=&month=&year=&q=&format=pdf
router.get('/partner', getPartnerLedger);

module.exports = router;

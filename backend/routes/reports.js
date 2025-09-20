const express = require('express');
const router = express.Router();
const {
  getStockReport,
  getProfitAndLoss,
  getBalanceSheet,
} = require('../controllers/reportsController');

// GET /api/reports/stock
router.get('/stock', getStockReport);

// GET /api/reports/pl
router.get('/pl', getProfitAndLoss);

// GET /api/reports/balance-sheet
router.get('/balance-sheet', getBalanceSheet);

module.exports = router;

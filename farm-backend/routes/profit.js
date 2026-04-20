// farm-backend/routes/profit.js
const express = require('express');
const router  = express.Router();
const { getMonthlyProfit } = require('../controllers/profitController');

router.get('/', getMonthlyProfit);  // GET /api/profit

module.exports = router;
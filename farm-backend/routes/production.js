// routes/production.js
const express = require('express');
const router = express.Router();
const {
  getAllProduction,
  addProduction,
  getTodayProduction,
  deleteProduction,
  getLast7Days
} = require('../controllers/productionController');

router.get('/today', getTodayProduction);  // GET /api/production/today
router.get('/', getAllProduction);          // GET /api/production
router.post('/', addProduction);            // POST /api/production
router.delete('/:id', deleteProduction);   // DELETE /api/production/:id
router.get('/last7days', getLast7Days);  // GET /api/production/last7days
module.exports = router;
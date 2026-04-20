// routes/expenses.js
const express = require('express');
const router = express.Router();
const {
  getAllExpenses,
  addExpense,
  deleteExpense,
  getMonthlyTotal
} = require('../controllers/expenseController');

router.get('/monthly-total', getMonthlyTotal);  // GET /api/expenses/monthly-total
router.get('/', getAllExpenses);                  // GET /api/expenses
router.post('/', addExpense);                     // POST /api/expenses
router.delete('/:id', deleteExpense);            // DELETE /api/expenses/:id

module.exports = router;
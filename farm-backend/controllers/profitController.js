// farm-backend/controllers/profitController.js
// Calculates profit = income - expenses for the current month

const Production = require('../models/Production');
const Expense    = require('../models/Expense');

exports.getMonthlyProfit = async (req, res) => {
  try {
    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // --- EXPENSES this month ---
    const expenseResult = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = expenseResult[0]?.total || 0;

    // --- INCOME this month ---
    // Get all production records this month
    const productions = await Production.find({
      date: { $gte: startOfMonth }
    });

    // Use price rates (can be made configurable later)
    const MILK_PRICE_PER_LITER = req.query.milkPrice || 40;  // ₹40/litre default
    const EGG_PRICE_EACH       = req.query.eggPrice  || 6;   // ₹6/egg default

    const totalMilkLiters = productions.reduce((s, p) => s + (p.milkLiters || 0), 0);
    const totalEggs       = productions.reduce((s, p) => s + (p.eggsCount  || 0), 0);

    const milkIncome  = totalMilkLiters * MILK_PRICE_PER_LITER;
    const eggIncome   = totalEggs       * EGG_PRICE_EACH;
    const totalIncome = milkIncome + eggIncome;

    const profit = totalIncome - totalExpenses;

    res.json({
      totalIncome:   Math.round(totalIncome),
      totalExpenses: Math.round(totalExpenses),
      profit:        Math.round(profit),
      milkIncome:    Math.round(milkIncome),
      eggIncome:     Math.round(eggIncome),
      totalMilkLiters,
      totalEggs,
      milkPrice:     Number(MILK_PRICE_PER_LITER),
      eggPrice:      Number(EGG_PRICE_EACH),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating profit', error: error.message });
  }
};
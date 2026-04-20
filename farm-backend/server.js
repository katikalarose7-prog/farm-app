// farm-backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
// ---- MIDDLEWARE ----
app.use(cors());

app.use(express.json());
// ---- DATABASE ----
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ DB Error:', err));

// ---- ROUTES ----
// All routes are prefixed with /api/
app.use('/api/livestock', require('./routes/livestock'));
app.use('/api/production', require('./routes/production'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/profit', require('./routes/profit'));

// ---- ROOT ----
app.get('/', (req, res) => {
  res.json({ message: '🌾 Farm API running!' });
});

// ---- START ----
app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
});
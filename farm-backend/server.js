// farm-backend/server.js
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const { protect } = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ DB Error:', err.message));

// ---- PUBLIC ROUTES (no login needed) ----
app.use('/api/auth', require('./routes/auth'));

// ---- PROTECTED ROUTES (must be logged in) ----
// Adding 'protect' here means ALL routes below require a valid token
app.use('/api/livestock',  protect, require('./routes/livestock'));
app.use('/api/production', protect, require('./routes/production'));
app.use('/api/workers',    protect, require('./routes/workers'));
app.use('/api/expenses',   protect, require('./routes/expenses'));
app.use('/api/profit',     protect, require('./routes/profit'));

app.get('/', (req, res) => res.json({ message: '🌾 Farm API running!' }));

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
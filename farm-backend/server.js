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

// ---- Database ----
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ DB Error:', err.message));

// ---- Public routes ----
app.use('/api/auth', require('./routes/auth'));

// ---- Protected routes ----
app.use('/api/livestock',  protect, require('./routes/livestock'));
app.use('/api/production', protect, require('./routes/production'));
app.use('/api/workers',    protect, require('./routes/workers'));
app.use('/api/expenses',   protect, require('./routes/expenses'));
app.use('/api/profit',     protect, require('./routes/profit'));
app.use('/api/settings',   protect, require('./routes/settings'));
app.use('/api/categories', protect, require('./routes/categories'));


app.get('/', (req, res) => res.json({ message: '🌾 Farm API running!' }));

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
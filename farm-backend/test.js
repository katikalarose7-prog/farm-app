// farm-backend/test.js
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ DB connected');

    // Try creating a test user
    const user = await User.create({
      name:     'Test User',
      email:    `test${Date.now()}@test.com`,
      password: '123456',
      phone:    '1234567890',
      address:  'Test address',
      role:     'customer'
    });

    console.log('✅ User created:', user.name, user.role);
    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.log('❌ Error:', err.message);
    process.exit(1);
  }
}

test();
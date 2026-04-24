// farm-backend/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productName:  { type: String, required: true },
  emoji:        { type: String, default: '📦'  },
  unit:         { type: String, default: 'piece'},
  pricePerUnit: { type: Number, required: true  },
  quantity:     { type: Number, required: true  },
  totalPrice:   { type: Number, required: true  },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Link to customer account
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Delivery info (copied from form at time of order)
  customerName:    { type: String, required: true },
  customerEmail:   { type: String, required: true },
  customerPhone:   { type: String, required: true },
  deliveryAddress: { type: String, required: true },

  items:        [orderItemSchema],
  totalAmount:  { type: Number, required: true },
  paymentMethod:{ type: String, default: 'Cash on Delivery' },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending'
  },

  isRead: { type: Boolean, default: false },
  notes:  { type: String,  default: ''    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
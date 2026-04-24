// farm-backend/controllers/orderController.js
const Order = require('../models/Order');

let sendOrderConfirmation, sendAdminNotification, sendStatusUpdate;

try {
  const emailUtils      = require('../utils/sendEmail');
  sendOrderConfirmation = emailUtils.sendOrderConfirmation;
  sendAdminNotification = emailUtils.sendAdminNotification;
  sendStatusUpdate      = emailUtils.sendStatusUpdate;
  console.log('✅ Email utils loaded');
} catch (err) {
  console.log('❌ Email utils failed to load:', err.message);
}

// POST place order
exports.placeOrder = async (req, res) => {
  try {
    const {
      customerName, customerEmail,
      customerPhone, deliveryAddress,
      items, notes
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ message: 'Please fill all delivery details.' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const totalAmount = items.reduce((s, i) => s + i.totalPrice, 0);

    const order = await Order.create({
      customerId:      req.user._id,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      items,
      totalAmount,
      notes:         notes || '',
      paymentMethod: 'Cash on Delivery'
    });

    console.log('✅ Order created:', order._id);
    console.log('📧 Sending emails to:', customerEmail);

    // Send emails
    try {
      if (sendOrderConfirmation) {
        await sendOrderConfirmation(order);
        console.log('✅ Confirmation email sent to customer');
      } else {
        console.log('❌ sendOrderConfirmation not available');
      }

      if (sendAdminNotification) {
        await sendAdminNotification(order);
        console.log('✅ Notification email sent to admin');
      } else {
        console.log('❌ sendAdminNotification not available');
      }
    } catch (emailError) {
      console.log('❌ Email sending failed:', emailError.message);
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: order._id,
      order
    });

  } catch (error) {
    console.log('❌ Place order error:', error.message);
    res.status(500).json({ message: 'Could not place order.', error: error.message });
  }
};

// GET customer's own orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders.' });
  }
};

// GET all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders.' });
  }
};

// GET unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Order.countDocuments({ isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error.' });
  }
};

// PUT mark single order read
exports.markOrderRead = async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Error.' });
  }
};

// PUT mark all read
exports.markAllRead = async (req, res) => {
  try {
    await Order.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Error.' });
  }
};

// PUT update order status — sends email to customer
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'delivered', 'cancelled'];

    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    console.log('✅ Order status updated to:', status);
    console.log('📧 Sending status email to:', order.customerEmail);

    // Send status update email
    try {
      if (sendStatusUpdate) {
        await sendStatusUpdate(order);
        console.log('✅ Status email sent to:', order.customerEmail);
      } else {
        console.log('❌ sendStatusUpdate not available');
      }
    } catch (emailError) {
      console.log('❌ Status email failed:', emailError.message);
    }

    res.json(order);

  } catch (error) {
    console.log('❌ Update status error:', error.message);
    res.status(500).json({ message: 'Error updating status.' });
  }
};
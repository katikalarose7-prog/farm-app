// farm-backend/controllers/orderController.js
const Order   = require('../models/Order');
const Product = require('../models/Product');

let sendOrderConfirmation, sendAdminNotification, sendStatusUpdate;
try {
  const emailUtils      = require('../utils/sendEmail');
  sendOrderConfirmation = emailUtils.sendOrderConfirmation;
  sendAdminNotification = emailUtils.sendAdminNotification;
  sendStatusUpdate      = emailUtils.sendStatusUpdate;
} catch (err) {
  console.log('Email utils not loaded:', err.message);
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

    // ---- Validate each item: stock + minQty ----
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({
          message: `Product "${item.productName}" no longer exists.`
        });
      }
      if (!product.published || !product.available) {
        return res.status(400).json({
          message: `"${item.productName}" is no longer available.`
        });
      }
      if (product.stock > 0 && item.quantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} ${product.unit} of "${item.productName}" available.`
        });
      }
      if (item.quantity < product.minOrderQty) {
        return res.status(400).json({
          message: `Minimum order for "${item.productName}" is ${product.minOrderQty} ${product.unit}.`
        });
      }
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

    // Reduce stock for each product
    for (const item of items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    // Send emails
    try {
      if (sendOrderConfirmation) await sendOrderConfirmation(order);
      if (sendAdminNotification) await sendAdminNotification(order);
    } catch (emailError) {
      console.log('Email error:', emailError.message);
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: order._id,
      order
    });

  } catch (error) {
    console.log('Place order error:', error.message);
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

// PUT update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // If cancelled — restore stock
    if (status === 'cancelled') {
      for (const item of order.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } }
          );
        }
      }
    }

    try {
      if (sendStatusUpdate) await sendStatusUpdate(order);
    } catch (emailError) {
      console.log('Status email error:', emailError.message);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status.' });
  }
};

// GET revenue from delivered orders only
exports.getRevenue = async (req, res) => {
  try {
    const deliveredOrders = await Order.find({ status: 'delivered' });

    const totalRevenue = deliveredOrders.reduce(
      (s, o) => s + o.totalAmount, 0
    );

    const monthlyRevenue = {};
    deliveredOrders.forEach(order => {
      const key = new Date(order.createdAt)
        .toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + order.totalAmount;
    });

    res.json({
      totalRevenue,
      deliveredCount: deliveredOrders.length,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue.' });
  }
};
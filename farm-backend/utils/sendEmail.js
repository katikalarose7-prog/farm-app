// farm-backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// ---- Send order confirmation to customer ----
exports.sendOrderConfirmation = async (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e2e8f0">
        ${item.emoji} ${item.productName}
      </td>
      <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center">
        ${item.quantity} ${item.unit}
      </td>
      <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;color:#2d6a4f">
        ₹${item.totalPrice}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
      
      <div style="background:#2d6a4f;padding:32px;text-align:center">
        <div style="font-size:40px;margin-bottom:8px">🌾</div>
        <h1 style="color:white;margin:0;font-size:24px">Tully Farm</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">
          Fresh from our farm to your doorstep
        </p>
      </div>

      <div style="padding:32px">
        <h2 style="color:#1a202c;margin:0 0 8px">
          🎉 Order Confirmed!
        </h2>
        <p style="color:#4a5568;margin:0 0 24px;font-size:15px;line-height:1.6">
          Hi <strong>${order.customerName}</strong>, thank you for your order!
          We've received it and will contact you shortly to confirm delivery.
        </p>

        <div style="background:#f7fafc;border-radius:8px;padding:16px;margin-bottom:24px">
          <div style="font-size:12px;font-weight:700;color:#2d6a4f;
                      text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">
            Order Summary
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead>
              <tr style="background:#edf2f7">
                <th style="padding:10px;text-align:left;color:#4a5568">Item</th>
                <th style="padding:10px;text-align:center;color:#4a5568">Qty</th>
                <th style="padding:10px;text-align:right;color:#4a5568">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr style="background:#f0fff4">
                <td colspan="2" style="padding:12px;font-weight:700;color:#1a202c">
                  Total Amount
                </td>
                <td style="padding:12px;font-weight:800;color:#2d6a4f;
                            text-align:right;font-size:18px">
                  ₹${order.totalAmount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background:#fefcbf;border:1px solid #f6e05e;border-radius:8px;
                    padding:14px;margin-bottom:24px">
          <div style="font-weight:700;color:#744210;margin-bottom:4px">
            💵 Payment: Cash on Delivery
          </div>
          <div style="font-size:13px;color:#744210">
            Please keep the exact amount ready at the time of delivery.
          </div>
        </div>

        <div style="background:#f7fafc;border-radius:8px;padding:16px;margin-bottom:24px">
          <div style="font-size:12px;font-weight:700;color:#2d6a4f;
                      text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">
            Delivery Details
          </div>
          <div style="font-size:14px;color:#4a5568;line-height:1.8">
            <div>📍 <strong>Address:</strong> ${order.deliveryAddress}</div>
            <div>📞 <strong>Phone:</strong> ${order.customerPhone}</div>
            ${order.notes ? `<div>📝 <strong>Notes:</strong> ${order.notes}</div>` : ''}
          </div>
        </div>

        <p style="font-size:14px;color:#718096;line-height:1.6;margin:0">
          If you have any questions, please contact us at
          <a href="mailto:katikalarose7@gmail.com" style="color:#2d6a4f;font-weight:600">
            katikalarose7@gmail.com
          </a>
        </p>
      </div>

      <div style="background:#f7fafc;padding:20px;text-align:center;
                  border-top:1px solid #e2e8f0">
        <p style="margin:0;font-size:12px;color:#a0aec0">
          🌾 Tully Farm · Pure. Natural. Fresh.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    `"Tully Farm 🌾" <${process.env.EMAIL_USER}>`,
    to:      order.customerEmail,
    subject: `✅ Order Confirmed — Tully Farm (#${String(order._id).slice(-6).toUpperCase()})`,
    html
  });
};

// ---- Send status update email to customer ----
exports.sendStatusUpdate = async (order) => {
  const statusMessages = {
    confirmed: {
      emoji:   '✅',
      title:   'Order Confirmed!',
      message: 'Great news! Your order has been confirmed and is being prepared for delivery.',
      color:   '#bee3f8',
      text:    '#2a4365'
    },
    delivered: {
      emoji:   '🚚',
      title:   'Order Delivered!',
      message: 'Your order has been delivered. We hope you enjoy our fresh farm products!',
      color:   '#c6f6d5',
      text:    '#22543d'
    },
    cancelled: {
      emoji:   '❌',
      title:   'Order Cancelled',
      message: 'Unfortunately your order has been cancelled. Please contact us for more information.',
      color:   '#fed7d7',
      text:    '#742a2a'
    }
  };

  const info = statusMessages[order.status];
  if (!info) return; // Don't send email for 'pending' status

  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;
                background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">

      <div style="background:#2d6a4f;padding:32px;text-align:center">
        <div style="font-size:40px;margin-bottom:8px">🌾</div>
        <h1 style="color:white;margin:0;font-size:24px">Tully Farm</h1>
      </div>

      <div style="padding:32px">
        <div style="background:${info.color};border-radius:10px;padding:20px;
                    margin-bottom:24px;text-align:center">
          <div style="font-size:36px;margin-bottom:8px">${info.emoji}</div>
          <h2 style="color:${info.text};margin:0;font-size:20px">${info.title}</h2>
        </div>

        <p style="color:#4a5568;font-size:15px;line-height:1.6;margin:0 0 24px">
          Hi <strong>${order.customerName}</strong>,<br/>${info.message}
        </p>

        <div style="background:#f7fafc;border-radius:8px;padding:16px;margin-bottom:24px">
          <div style="font-size:12px;font-weight:700;color:#2d6a4f;
                      text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">
            Your Order
          </div>
          ${order.items.map(i => `
            <div style="display:flex;justify-content:space-between;
                        font-size:14px;padding:6px 0;color:#4a5568;
                        border-bottom:1px solid #e2e8f0">
              <span>${i.emoji} ${i.productName} × ${i.quantity} ${i.unit}</span>
              <span style="font-weight:700;color:#2d6a4f">₹${i.totalPrice}</span>
            </div>
          `).join('')}
          <div style="display:flex;justify-content:space-between;
                      font-size:16px;font-weight:800;padding-top:10px;
                      margin-top:6px;color:#1a202c">
            <span>Total</span>
            <span style="color:#2d6a4f">₹${order.totalAmount}</span>
          </div>
        </div>

        <p style="font-size:14px;color:#718096;margin:0">
          Questions? Contact us at
          <a href="mailto:katikalarose7@gmail.com" style="color:#2d6a4f;font-weight:600">
            katikalarose7@gmail.com
          </a>
        </p>
      </div>

      <div style="background:#f7fafc;padding:20px;text-align:center;
                  border-top:1px solid #e2e8f0">
        <p style="margin:0;font-size:12px;color:#a0aec0">
          🌾 Tully Farm · Pure. Natural. Fresh.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    `"Tully Farm 🌾" <${process.env.EMAIL_USER}>`,
    to:      order.customerEmail,
    subject: `${info.emoji} Order ${info.title} — Tully Farm`,
    html
  });
};

// ---- Send notification to admin ----
exports.sendAdminNotification = async (order) => {
  const itemsText = order.items
    .map(i => `• ${i.emoji} ${i.productName} × ${i.quantity} ${i.unit} — ₹${i.totalPrice}`)
    .join('\n');

  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;
                background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">

      <div style="background:#2d6a4f;padding:24px;text-align:center">
        <h2 style="color:white;margin:0">🔔 New Order Received!</h2>
      </div>

      <div style="padding:24px">
        <div style="background:#f0fff4;border:1px solid #c6f6d5;border-radius:8px;
                    padding:16px;margin-bottom:20px">
          <div style="font-size:18px;font-weight:800;color:#2d6a4f;margin-bottom:4px">
            ₹${order.totalAmount} — Cash on Delivery
          </div>
          <div style="font-size:13px;color:#4a5568">
            Order ID: #${String(order._id).slice(-6).toUpperCase()}
          </div>
        </div>

        <div style="margin-bottom:16px">
          <div style="font-weight:700;color:#1a202c;margin-bottom:8px">
            👤 Customer Details
          </div>
          <div style="font-size:14px;color:#4a5568;line-height:1.8">
            <div>Name: <strong>${order.customerName}</strong></div>
            <div>Email: <strong>${order.customerEmail}</strong></div>
            <div>Phone: <strong>${order.customerPhone}</strong></div>
            <div>Address: <strong>${order.deliveryAddress}</strong></div>
            ${order.notes ? `<div>Notes: <strong>${order.notes}</strong></div>` : ''}
          </div>
        </div>

        <div style="margin-bottom:20px">
          <div style="font-weight:700;color:#1a202c;margin-bottom:8px">
            🛒 Items Ordered
          </div>
          ${order.items.map(i => `
            <div style="display:flex;justify-content:space-between;
                        font-size:14px;padding:8px 0;
                        border-bottom:1px solid #f0f0f0;color:#4a5568">
              <span>${i.emoji} ${i.productName} × ${i.quantity} ${i.unit}</span>
              <span style="font-weight:700;color:#2d6a4f">₹${i.totalPrice}</span>
            </div>
          `).join('')}
        </div>

        <a href="${process.env.FRONTEND_URL || 'https://tully-farms.pages.dev'}/dashboard/orders"
           style="display:block;background:#2d6a4f;color:white;text-align:center;
                  padding:14px;border-radius:10px;text-decoration:none;
                  font-size:15px;font-weight:700">
          View Order in Dashboard →
        </a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    `"Tully Farm Orders 🌾" <${process.env.EMAIL_USER}>`,
    to:      process.env.EMAIL_USER, // Send to admin email
    subject: `🔔 New Order ₹${order.totalAmount} from ${order.customerName}`,
    html
  });
};
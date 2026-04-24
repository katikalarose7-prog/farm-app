// src/pages/customer/MyOrdersPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { getMyOrders }         from '../../api/api';
import { useCustomerAuth }     from '../../context/CustomerAuthContext';
import './MyOrdersPage.css';

const STATUS = {
  pending:   { label: 'Pending',   color: '#fefcbf', text: '#744210', emoji: '⏳' },
  confirmed: { label: 'Confirmed', color: '#bee3f8', text: '#2a4365', emoji: '✅' },
  delivered: { label: 'Delivered', color: '#c6f6d5', text: '#22543d', emoji: '🚚' },
  cancelled: { label: 'Cancelled', color: '#fed7d7', text: '#742a2a', emoji: '❌' },
};

function MyOrdersPage() {
  const { customer, logoutCustomer } = useCustomerAuth();
  const navigate                     = useNavigate();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!customer) { navigate('/customer/login'); return; }
    fetchOrders();
  }, [customer]);

  async function fetchOrders() {
    try {
      const res = await getMyOrders();
      setOrders(res.data);
    } catch {
      alert('Could not load orders.');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <div className="myorders-page">

      {/* Navbar */}
      <nav className="shop-nav">
        <div className="shop-nav-brand">
          <span>🌾</span>
          <span className="shop-nav-name">Tully Farm</span>
        </div>
        <div className="shop-nav-right">
          <button
            className="shop-orders-btn"
            onClick={() => navigate('/customer/shop')}
          >
            🛒 Shop
          </button>
          <div className="shop-user-info">
            <span className="shop-welcome">👋 {customer?.name?.split(' ')[0]}</span>
            <button
              className="shop-logout"
              onClick={() => { logoutCustomer(); navigate('/'); }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="myorders-content">
        <h1 className="page-title">📦 My Orders</h1>

        {loading ? (
          <p className="loading-text">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>You haven't placed any orders yet.</p>
            <button
              className="checkout-btn"
              style={{ maxWidth: 200, margin: '0 auto' }}
              onClick={() => navigate('/customer/shop')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="myorders-list">
            {orders.map(order => {
              const cfg        = STATUS[order.status];
              const isExpanded = expanded === order._id;

              return (
                <div key={order._id} className="myorder-card">
                  <div
                    className="myorder-header"
                    onClick={() => setExpanded(isExpanded ? null : order._id)}
                  >
                    <div className="myorder-left">
                      <div className="myorder-date">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="myorder-items-preview">
                        {order.items.map(i =>
                          `${i.emoji} ${i.productName} × ${i.quantity}`
                        ).join('  ·  ')}
                      </div>
                    </div>
                    <div className="myorder-right">
                      <div className="myorder-amount">
                        ₹{order.totalAmount}
                      </div>
                      <span
                        className="myorder-status"
                        style={{ background: cfg.color, color: cfg.text }}
                      >
                        {cfg.emoji} {cfg.label}
                      </span>
                      <span className={`expand-btn ${isExpanded ? 'open' : ''}`}>
                        ▾
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="myorder-details">
                      <div className="myorder-section">
                        <div className="myorder-section-title">🛒 Items</div>
                        {order.items.map((item, i) => (
                          <div key={i} className="myorder-item">
                            <span>{item.emoji} {item.productName}</span>
                            <span>
                              × {item.quantity} {item.unit} — ₹{item.totalPrice}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="myorder-section">
                        <div className="myorder-section-title">🚚 Delivery</div>
                        <div className="myorder-detail-row">
                          <span>Address</span>
                          <span>{order.deliveryAddress}</span>
                        </div>
                        <div className="myorder-detail-row">
                          <span>Payment</span>
                          <span>{order.paymentMethod}</span>
                        </div>
                        {order.notes && (
                          <div className="myorder-detail-row">
                            <span>Notes</span>
                            <span>{order.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;
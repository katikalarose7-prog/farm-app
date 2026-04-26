// src/pages/OrdersPage.jsx
import { useEffect, useState } from 'react';
import {
  getAllOrders,
  updateOrderStatus,
  markOrderRead,
  markAllRead
} from '../api/api';
import './OrdersPage.css';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#fefcbf', text: '#744210', emoji: '⏳' },
  confirmed: { label: 'Confirmed', color: '#bee3f8', text: '#2a4365', emoji: '✅' },
  delivered: { label: 'Delivered', color: '#c6f6d5', text: '#22543d', emoji: '🚚' },
  cancelled: { label: 'Cancelled', color: '#fed7d7', text: '#742a2a', emoji: '❌' },
};

function OrdersPage() {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [expanded,     setExpanded]     = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating,     setUpdating]     = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError('');
      const res = await getAllOrders();
      setOrders(res.data);
    } catch (err) {
      console.log('Orders fetch error:', err);
      setError('Could not load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(orderId, status) {
    try {
      setUpdating(orderId);
      await updateOrderStatus(orderId, status);
      await markOrderRead(orderId);
      fetchOrders();
    } catch {
      alert('Could not update status.');
    } finally {
      setUpdating(null);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead();
      fetchOrders();
    } catch {
      alert('Could not mark all read.');
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', {
      day:    'numeric',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit'
    });
  }

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const unreadCount = orders.filter(o => !o.isRead).length;

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="page orders-page">

      {/* ---- HEADER ---- */}
      <div className="orders-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          📦 Orders
        </h1>
        {unreadCount > 0 && (
          <button className="btn btn-primary mark-read-btn" onClick={handleMarkAllRead}>
            ✅ Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {error && (
        <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>
      )}

      {/* ---- SUMMARY CARDS ---- */}
      <div className="orders-summary">
        <div className="osum-card">
          <div className="osum-icon">📦</div>
          <div className="osum-val">{counts.all}</div>
          <div className="osum-lbl">Total</div>
        </div>
        <div className="osum-card pending-card">
          <div className="osum-icon">⏳</div>
          <div className="osum-val">{counts.pending}</div>
          <div className="osum-lbl">Pending</div>
        </div>
        <div className="osum-card confirmed-card">
          <div className="osum-icon">✅</div>
          <div className="osum-val">{counts.confirmed}</div>
          <div className="osum-lbl">Confirmed</div>
        </div>
        <div className="osum-card delivered-card">
          <div className="osum-icon">🚚</div>
          <div className="osum-val">{counts.delivered}</div>
          <div className="osum-lbl">Delivered</div>
        </div>
        <div className="osum-card revenue-card">
          <div className="osum-icon">💰</div>
          <div className="osum-val">₹{totalRevenue.toLocaleString()}</div>
          <div className="osum-lbl">Revenue</div>
        </div>
      </div>

      {/* ---- FILTER TABS ---- */}
      <div className="orders-filter-tabs">
        {[
          { key: 'all',       label: `All (${counts.all})`                              },
          { key: 'pending',   label: `⏳ Pending (${counts.pending})`                   },
          { key: 'confirmed', label: `✅ Confirmed (${counts.confirmed})`               },
          { key: 'delivered', label: `🚚 Delivered (${counts.delivered})`               },
          { key: 'cancelled', label: `❌ Cancelled (${counts.cancelled})`               },
        ].map(tab => (
          <button
            key={tab.key}
            className={`orders-filter-tab ${filterStatus === tab.key ? 'active' : ''}`}
            onClick={() => setFilterStatus(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- ORDERS LIST ---- */}
      {loading ? (
        <div className="orders-loading">
          <div className="orders-spinner" />
          <p>Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">📭</div>
          <p>No {filterStatus === 'all' ? '' : filterStatus} orders yet.</p>
          {filterStatus !== 'all' && (
            <button
              className="btn"
              onClick={() => setFilterStatus('all')}
            >
              Show all orders
            </button>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => {
            const cfg        = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isExpanded = expanded === order._id;
            const isUpdating = updating === order._id;

            return (
              <div
                key={order._id}
                className={`order-card ${!order.isRead ? 'unread' : ''}`}
              >
                {/* Unread indicator dot */}
                {!order.isRead && <div className="unread-dot" />}

                {/* ---- CARD HEADER ---- */}
                <div
                  className="order-card-header"
                  onClick={() => {
                    setExpanded(isExpanded ? null : order._id);
                    if (!order.isRead) {
                      markOrderRead(order._id).then(fetchOrders);
                    }
                  }}
                >
                  <div className="order-card-left">
                    <div className="order-customer-name">
                      {order.customerName}
                    </div>
                    <div className="order-card-meta">
                      📞 {order.customerPhone}
                    </div>
                    <div className="order-card-meta">
                      🕐 {formatDate(order.createdAt)}
                    </div>
                    <div className="order-items-preview">
                      {order.items.slice(0, 2).map((i, idx) => (
                        <span key={idx} className="order-item-chip">
                          {i.emoji} {i.productName} ×{i.quantity}
                        </span>
                      ))}
                      {order.items.length > 2 && (
                        <span className="order-item-chip">
                          +{order.items.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="order-card-right">
                    <div className="order-amount">
                      ₹{order.totalAmount.toLocaleString()}
                    </div>
                    <span
                      className="order-status-badge"
                      style={{
                        background: cfg.color,
                        color:      cfg.text
                      }}
                    >
                      {cfg.emoji} {cfg.label}
                    </span>
                    <span className={`order-expand-btn ${isExpanded ? 'open' : ''}`}>
                      ▾
                    </span>
                  </div>
                </div>

                {/* ---- EXPANDED PANEL ---- */}
                {isExpanded && (
                  <div className="order-expanded">

                    {/* Items */}
                    <div className="order-section">
                      <div className="order-section-title">🛒 Items Ordered</div>
                      {order.items.map((item, i) => (
                        <div key={i} className="order-item-row">
                          <span className="oi-emoji">{item.emoji}</span>
                          <span className="oi-name">{item.productName}</span>
                          <span className="oi-qty">
                            × {item.quantity} {item.unit}
                          </span>
                          <span className="oi-price">₹{item.totalPrice}</span>
                        </div>
                      ))}
                      <div className="order-items-total">
                        <span>Total</span>
                        <span>₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div className="order-section">
                      <div className="order-section-title">🚚 Delivery Info</div>
                      <div className="order-detail-row">
                        <span>📧 Email</span>
                        <span>{order.customerEmail}</span>
                      </div>
                      <div className="order-detail-row">
                        <span>📞 Phone</span>
                        <span>{order.customerPhone}</span>
                      </div>
                      <div className="order-detail-row">
                        <span>📍 Address</span>
                        <span>{order.deliveryAddress}</span>
                      </div>
                      <div className="order-detail-row">
                        <span>💵 Payment</span>
                        <span>{order.paymentMethod}</span>
                      </div>
                      {order.notes && (
                        <div className="order-detail-row">
                          <span>📝 Notes</span>
                          <span>{order.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Status update */}
                    <div className="order-section order-status-section">
                      <div className="order-section-title">
                        Update Order Status
                      </div>
                      <div className="status-btn-group">
                        {['pending', 'confirmed', 'delivered', 'cancelled'].map(s => (
                          <button
                            key={s}
                            disabled={isUpdating}
                            className={`status-update-btn ${order.status === s ? 'active' : ''}`}
                            style={order.status === s ? {
                              background:   STATUS_CONFIG[s].color,
                              color:        STATUS_CONFIG[s].text,
                              borderColor:  STATUS_CONFIG[s].text,
                              fontWeight:   700
                            } : {}}
                            onClick={() => handleStatus(order._id, s)}
                          >
                            {isUpdating
                              ? '⏳'
                              : `${STATUS_CONFIG[s].emoji} ${STATUS_CONFIG[s].label}`
                            }
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
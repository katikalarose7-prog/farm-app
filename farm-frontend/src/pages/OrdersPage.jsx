// src/pages/OrdersPage.jsx
import { useEffect, useState } from 'react';
import {
  getAllOrders, updateOrderStatus,
  markOrderRead, markAllRead
} from '../api/api';
import './OrdersPage.css';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#fefcbf', text: '#744210', emoji: '⏳' },
  confirmed: { label: 'Confirmed', color: '#bee3f8', text: '#2a4365', emoji: '✅' },
  delivered: { label: 'Delivered', color: '#c6f6d5', text: '#22543d', emoji: '🚚' },
  cancelled: { label: 'Cancelled', color: '#fed7d7', text: '#742a2a', emoji: '❌' },
};

function OrdersPage() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState(null);
  const [filterStatus, setFilter]  = useState('all');

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await getAllOrders();
      setOrders(res.data);
    } catch {
      alert('Could not load orders.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id, status) {
    try {
      await updateOrderStatus(id, status);
      await markOrderRead(id);
      fetchOrders();
    } catch {
      alert('Could not update status.');
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
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const unreadCount = orders.filter(o => !o.isRead).length;

  // Summary counts
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
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📦 Orders</h1>
        {unreadCount > 0 && (
          <button className="btn btn-primary" onClick={handleMarkAllRead}>
            ✅ Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="orders-summary">
        <div className="osum-card">
          <div className="osum-icon">📦</div>
          <div className="osum-val">{counts.all}</div>
          <div className="osum-lbl">Total Orders</div>
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
          <div className="osum-lbl">Total Revenue</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" style={{ marginBottom: 12 }}>
        {['all','pending','confirmed','delivered','cancelled'].map(s => (
          <button
            key={s}
            className={`filter-tab ${filterStatus === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? `All (${counts.all})`
              : `${STATUS_CONFIG[s].emoji} ${STATUS_CONFIG[s].label} (${counts[s]})`}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <p className="loading-text">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No {filterStatus === 'all' ? '' : filterStatus} orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => {
            const cfg        = STATUS_CONFIG[order.status];
            const isExpanded = expanded === order._id;

            return (
              <div
                key={order._id}
                className={`order-card ${!order.isRead ? 'unread' : ''}`}
              >
                {/* Unread dot */}
                {!order.isRead && <div className="unread-dot" />}

                {/* Order header */}
                <div
                  className="order-header"
                  onClick={() => {
                    setExpanded(isExpanded ? null : order._id);
                    if (!order.isRead) markOrderRead(order._id).then(fetchOrders);
                  }}
                >
                  <div className="order-header-left">
                    <div className="order-customer-name">
                      {order.customerName}
                    </div>
                    <div className="order-meta">
                      📞 {order.customerPhone} &nbsp;·&nbsp;
                      📧 {order.customerEmail} &nbsp;·&nbsp;
                      🕐 {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <div className="order-header-right">
                    <div className="order-amount">
                      ₹{order.totalAmount.toLocaleString()}
                    </div>
                    <span
                      className="order-status-badge"
                      style={{ background: cfg.color, color: cfg.text }}
                    >
                      {cfg.emoji} {cfg.label}
                    </span>
                    <button className={`expand-btn ${isExpanded ? 'open' : ''}`}>
                      ▾
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="order-details">

                    {/* Items */}
                    <div className="order-items">
                      <div className="order-section-title">🛒 Items Ordered</div>
                      {order.items.map((item, i) => (
                        <div key={i} className="order-item">
                          <span className="order-item-emoji">{item.emoji}</span>
                          <span className="order-item-name">{item.productName}</span>
                          <span className="order-item-qty">
                            × {item.quantity} {item.unit}
                          </span>
                          <span className="order-item-price">
                            ₹{item.totalPrice}
                          </span>
                        </div>
                      ))}
                      <div className="order-items-total">
                        <span>Total</span>
                        <span>₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div className="order-delivery">
                      <div className="order-section-title">🚚 Delivery Details</div>
                      <div className="delivery-row">
                        <span>📍 Address</span>
                        <span>{order.deliveryAddress}</span>
                      </div>
                      <div className="delivery-row">
                        <span>💵 Payment</span>
                        <span>{order.paymentMethod}</span>
                      </div>
                      {order.notes && (
                        <div className="delivery-row">
                          <span>📝 Notes</span>
                          <span>{order.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Status update */}
                    <div className="order-actions">
                      <div className="order-section-title">
                        Update Status
                      </div>
                      <div className="status-btns">
                        {['pending','confirmed','delivered','cancelled'].map(s => (
                          <button
                            key={s}
                            className={`status-btn ${order.status === s ? 'active' : ''}`}
                            style={order.status === s ? {
                              background: STATUS_CONFIG[s].color,
                              color: STATUS_CONFIG[s].text,
                              borderColor: STATUS_CONFIG[s].text
                            } : {}}
                            onClick={() => handleStatus(order._id, s)}
                          >
                            {STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}
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
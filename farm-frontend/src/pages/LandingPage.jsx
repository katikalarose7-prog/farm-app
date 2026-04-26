// src/pages/LandingPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { getProducts, placeOrder } from '../api/api';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const [products,    setProducts]    = useState([]);
  const [cart,        setCart]        = useState({});
  const [showCart,    setShowCart]    = useState(false);
  const [showCheckout,setShowCheckout]= useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [form, setForm] = useState({
    customerName: '', customerEmail: '',
    customerPhone: '', deliveryAddress: '', notes: ''
  });

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch {
      console.log('Could not load products');
    } finally {
      setLoading(false);
    }
  }

  // Cart helpers
  function addToCart(product) {
    setCart(prev => ({
      ...prev,
      [product._id]: {
        ...product,
        quantity: (prev[product._id]?.quantity || 0) + 1
      }
    }));
  }

  function removeFromCart(productId) {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[productId]?.quantity > 1) {
        updated[productId] = {
          ...updated[productId],
          quantity: updated[productId].quantity - 1
        };
      } else {
        delete updated[productId];
      }
      return updated;
    });
  }

  function clearCart() { setCart({}); }

  const cartItems      = Object.values(cart);
  const cartCount      = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal      = cartItems.reduce((s, i) => s + (i.pricePerUnit * i.quantity), 0);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail ||
        !form.customerPhone || !form.deliveryAddress) {
      return alert('Please fill all delivery details.');
    }
    if (cartItems.length === 0) {
      return alert('Your cart is empty.');
    }

    const items = cartItems.map(i => ({
      productName:  i.name,
      emoji:        i.emoji,
      unit:         i.unit,
      pricePerUnit: i.pricePerUnit,
      quantity:     i.quantity,
      totalPrice:   i.pricePerUnit * i.quantity
    }));

    try {
      setSubmitting(true);
      await placeOrder({
        ...form,
        items,
        totalAmount: cartTotal
      });
      clearCart();
      setShowCheckout(false);
      setShowCart(false);
      setShowSuccess(true);
      setForm({
        customerName: '', customerEmail: '',
        customerPhone: '', deliveryAddress: '', notes: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="landing">

      {/* NAVBAR */}
<nav className="land-nav">
  <div className="land-nav-brand">
    <span className="land-nav-logo">🌾</span>
    <span className="land-nav-name">Tully Farm</span>
  </div>
  <div className="land-nav-right">
    {/* Customer login in NAVBAR */}
    <button
      className="land-login-btn"
      onClick={() => navigate('/customer/login')}
    >
      🛒 Customer Login
    </button>
  </div>
</nav>
      {/* ---- HERO ---- */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🌿 Fresh from the Farm</div>
          <h1 className="hero-title">
            Pure. Natural.<br />Farm Fresh.
          </h1>
          <p className="hero-subtitle">
            Welcome to Tully Farm — where every drop of milk and
            every egg comes straight from our happy animals to your
            doorstep. Fresh every morning. Delivered with love.
          </p>
          <div className="hero-btns">
<button
  className="hero-btn-primary"
  onClick={() => navigate('/customer/login')}
>
  🛒 Order Now
</button>
            <button
              className="hero-btn-secondary"
              onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-animals">
          <div className="hero-animal-card">🐃<span>Buffalo</span></div>
          <div className="hero-animal-card">🐐<span>Goats</span></div>
          <div className="hero-animal-card">🐔<span>Hens</span></div>
          <div className="hero-animal-card">🌿<span>Organic</span></div>
        </div>
      </section>

      {/* ---- WHY US ---- */}
      <section className="why-us">
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">🌅</div>
            <h3>Fresh Daily</h3>
            <p>Collected every morning and delivered the same day</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🚫</div>
            <h3>No Chemicals</h3>
            <p>100% natural, no preservatives or artificial additives</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🚚</div>
            <h3>Home Delivery</h3>
            <p>We deliver right to your doorstep, cash on delivery</p>
          </div>
          <div className="why-card">
            <div className="why-icon">❤️</div>
            <h3>Happy Animals</h3>
            <p>Our animals are raised with care in open pastures</p>
          </div>
        </div>
      </section>

      {/* ---- ABOUT ---- */}
      <section className="about-section" id="about">
        <div className="about-content">
          <div className="about-text">
            <div className="section-label">About Us</div>
            <h2>A Family Farm<br />Built on Trust</h2>
            <p>
              Tully Farm has been providing pure, natural dairy and
              farm products for years. We believe in the old way —
              letting animals graze freely, eating natural feed, and
              living healthy lives. That's what makes our products
              taste so different.
            </p>
            <div className="about-stats">
              <div className="about-stat">
                <span className="about-stat-num">50+</span>
                <span className="about-stat-label">Happy Animals</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-num">200+</span>
                <span className="about-stat-label">Daily Customers</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-num">100%</span>
                <span className="about-stat-label">Natural</span>
              </div>
            </div>
          </div>
          <div className="about-emojis">
            <div className="about-emoji-grid">
              <div className="aeg-item">🐃</div>
              <div className="aeg-item">🥛</div>
              <div className="aeg-item">🐔</div>
              <div className="aeg-item">🥚</div>
              <div className="aeg-item">🐐</div>
              <div className="aeg-item">🫙</div>
              <div className="aeg-item">🌿</div>
              <div className="aeg-item">🌾</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- PRODUCTS ---- */}
      <section className="products-section" id="products">
        <div className="section-label" style={{ textAlign:'center' }}>
          Our Products
        </div>
        <h2 className="section-heading">Order Fresh Today</h2>
        <p className="section-sub">
          All products are collected fresh daily. Cash on delivery only.
        </p>

        {loading ? (
          <div className="products-loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-emoji">{product.emoji}</div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
<div className="product-footer">
  <div className="product-price">
    ₹{product.pricePerUnit}
    <span className="product-unit"> / {product.unit}</span>
  </div>
  <button
    className="add-to-cart-btn"
    onClick={() => setShowLoginPrompt(true)}
  >
    Order Now
  </button>
</div>
              </div>
            ))}
          </div>
        )}

        {/* Floating cart button when items added */}
        {cartCount > 0 && (
          <div className="floating-cart" onClick={() => setShowCart(true)}>
            <span>🛒 {cartCount} items</span>
            <span className="floating-cart-total">₹{cartTotal}</span>
            <span>View Cart →</span>
          </div>
        )}
      </section>

      {/* ---- HOW TO ORDER ---- */}
      <section className="how-section">
        <div className="section-label" style={{ textAlign:'center' }}>
          Simple Process
        </div>
        <h2 className="section-heading">How to Order</h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-num">1</div>
            <div className="how-icon">🛒</div>
            <h3>Add to Cart</h3>
            <p>Browse our products and add what you need</p>
          </div>
          <div className="how-arrow">→</div>
          <div className="how-step">
            <div className="how-num">2</div>
            <div className="how-icon">📝</div>
            <h3>Fill Details</h3>
            <p>Enter your name, phone and delivery address</p>
          </div>
          <div className="how-arrow">→</div>
          <div className="how-step">
            <div className="how-num">3</div>
            <div className="how-icon">🚚</div>
            <h3>We Deliver</h3>
            <p>Fresh products delivered to your door</p>
          </div>
          <div className="how-arrow">→</div>
          <div className="how-step">
            <div className="how-num">4</div>
            <div className="how-icon">💵</div>
            <h3>Pay on Delivery</h3>
            <p>Cash on delivery — no advance payment needed</p>
          </div>
        </div>
      </section>

      {/* ---- CONTACT ---- */}
      <section className="contact-section">
        <h2>Get in Touch</h2>
        <div className="contact-items">
          <div className="contact-item">
            <span>📧</span>
            <span>tullyfarm@gmail.com</span>
          </div>
          <div className="contact-item">
            <span>🌾</span>
            <span>Fresh produce every day</span>
          </div>
          <div className="contact-item">
            <span>🚚</span>
            <span>Cash on Delivery only</span>
          </div>
        </div>
      </section>

     {/* FOOTER — Admin login at bottom */}
<footer className="land-footer">
  <span>🌾 Tully Farm © 2025</span>
  <span>Pure. Natural. Fresh.</span>
  {/* Admin login at footer — not prominent */}
  <button onClick={() => navigate('/login')} className="footer-login">
    Farm Admin
  </button>
</footer>

      {/* ======== CART DRAWER ======== */}
      {showCart && (
        <div className="drawer-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>🛒 Your Cart</h2>
              <button onClick={() => setShowCart(false)}>✕</button>
            </div>

            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <div style={{ fontSize: 48 }}>🛒</div>
                <p>Your cart is empty</p>
                <button
                  className="hero-btn-primary"
                  onClick={() => setShowCart(false)}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map(item => (
                    <div key={item._id} className="cart-item">
                      <span className="cart-item-emoji">{item.emoji}</span>
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">
                          ₹{item.pricePerUnit} × {item.quantity}
                        </div>
                      </div>
                      <div className="qty-control">
                        <button onClick={() => removeFromCart(item._id)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                      <div className="cart-item-total">
                        ₹{item.pricePerUnit * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total-row">
                    <span>Total Amount</span>
                    <span className="cart-grand-total">₹{cartTotal}</span>
                  </div>
                  <div className="cod-badge">💵 Cash on Delivery Only</div>
                  <button
                    className="checkout-btn"
                    onClick={() => { setShowCart(false); setShowCheckout(true); }}
                  >
                    Proceed to Checkout →
                  </button>
                  <button className="clear-cart-btn" onClick={clearCart}>
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ======== CHECKOUT FORM ======== */}
      {showCheckout && (
        <div className="drawer-overlay" onClick={() => setShowCheckout(false)}>
          <div className="checkout-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>📦 Checkout</h2>
              <button onClick={() => setShowCheckout(false)}>✕</button>
            </div>

            {/* Order summary */}
            <div className="checkout-summary">
              {cartItems.map(item => (
                <div key={item._id} className="checkout-item">
                  <span>{item.emoji} {item.name} × {item.quantity}</span>
                  <span>₹{item.pricePerUnit * item.quantity}</span>
                </div>
              ))}
              <div className="checkout-total">
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="cod-badge">💵 Cash on Delivery</div>
            </div>

            {/* Delivery form */}
            <form onSubmit={handlePlaceOrder} className="checkout-form">
              <h3 className="checkout-form-title">Delivery Details</h3>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  value={form.customerName}
                  onChange={e => setForm({...form, customerName: e.target.value})}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={e => setForm({...form, customerEmail: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  value={form.customerPhone}
                  onChange={e => setForm({...form, customerPhone: e.target.value})}
                  placeholder="Your phone number"
                />
              </div>
              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea
                  value={form.deliveryAddress}
                  onChange={e => setForm({...form, deliveryAddress: e.target.value})}
                  placeholder="Full delivery address with landmark"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <input
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Any special instructions..."
                />
              </div>

              <button
                type="submit"
                className="place-order-btn"
                disabled={submitting}
              >
                {submitting ? '⏳ Placing Order...' : '✅ Place Order — Cash on Delivery'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======== SUCCESS POPUP ======== */}
      {showSuccess && (
        <div className="drawer-overlay">
          <div className="success-popup">
            <div className="success-icon">🎉</div>
            <h2>Order Placed!</h2>
            <p>
              Thank you for your order! We've received it and will
              contact you shortly to confirm delivery.
            </p>
            <div className="success-detail">
              💵 Payment: Cash on Delivery<br />
              📞 We'll call you to confirm
            </div>
            <button
              className="hero-btn-primary"
              onClick={() => setShowSuccess(false)}
              style={{ width: '100%', marginTop: 16 }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
{showLoginPrompt && (
  <div className="drawer-overlay" onClick={() => setShowLoginPrompt(false)}>
    <div className="land-login-prompt" onClick={e => e.stopPropagation()}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
      <h2>Login Required</h2>
      <p>Please login or create an account to place an order.</p>
      <button
        className="hero-btn-primary"
        onClick={() => navigate('/customer/login')}
        style={{ width: '100%', marginBottom: 10 }}
      >
        🔑 Customer Login / Register
      </button>
      <button
        className="hero-btn-secondary"
        onClick={() => setShowLoginPrompt(false)}
        style={{ width: '100%' }}
      >
        Maybe Later
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default LandingPage;
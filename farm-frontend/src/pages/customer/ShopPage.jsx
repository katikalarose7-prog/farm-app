// src/pages/customer/ShopPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { getProducts, placeOrder } from '../../api/api';
import { useCustomerAuth }     from '../../context/CustomerAuthContext';
import './ShopPage.css';

function ShopPage() {
  const { customer, logoutCustomer } = useCustomerAuth();
  const navigate                     = useNavigate();

  const [products,     setProducts]     = useState([]);
  const [cart,         setCart]         = useState({});
  const [showCart,     setShowCart]     = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [loading,      setLoading]      = useState(true);

  // Pre-fill delivery form from customer profile
  const [form, setForm] = useState({
    customerName:    customer?.name    || '',
    customerEmail:   customer?.email   || '',
    customerPhone:   customer?.phone   || '',
    deliveryAddress: customer?.address || '',
    notes: ''
  });

  useEffect(() => {
    if (!customer) { navigate('/customer/login'); return; }
    fetchProducts();
  }, [customer]);

  async function fetchProducts() {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  }

  // ---- Cart helpers ----
  function addToCart(product) {
    setCart(prev => ({
      ...prev,
      [product._id]: {
        ...product,
        quantity: (prev[product._id]?.quantity || 0) + 1
      }
    }));
  }

  function removeFromCart(id) {
    setCart(prev => {
      const u = { ...prev };
      if (u[id]?.quantity > 1) {
        u[id] = { ...u[id], quantity: u[id].quantity - 1 };
      } else {
        delete u[id];
      }
      return u;
    });
  }

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail ||
        !form.customerPhone || !form.deliveryAddress) {
      return alert('Please fill all delivery details.');
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
      await placeOrder({ ...form, items, totalAmount: cartTotal });
      setCart({});
      setShowCheckout(false);
      setShowCart(false);
      setShowSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    logoutCustomer();
    navigate('/');
  }

  return (
    <div className="shop-page">

      {/* ---- NAVBAR ---- */}
      <nav className="shop-nav">
        <div className="shop-nav-brand">
          <span>🌾</span>
          <span className="shop-nav-name">Tully Farm</span>
        </div>
        <div className="shop-nav-right">
          <button
            className="shop-orders-btn"
            onClick={() => navigate('/customer/orders')}
          >
            📦 My Orders
          </button>
          <button
            className="shop-cart-btn"
            onClick={() => setShowCart(true)}
          >
            🛒
            {cartCount > 0 && (
              <span className="shop-cart-badge">{cartCount}</span>
            )}
          </button>
          <div className="shop-user-info">
            <span className="shop-welcome">
              👋 {customer?.name?.split(' ')[0]}
            </span>
            <button className="shop-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ---- HERO BANNER ---- */}
      <div className="shop-hero">
        <h1>Fresh Farm Products</h1>
        <p>Straight from our farm to your doorstep. Cash on delivery.</p>
      </div>

      {/* ---- PRODUCTS GRID ---- */}
      <div className="shop-content">
        {loading ? (
          <div className="shop-loading">Loading products...</div>
        ) : (
          <div className="shop-products-grid">
            {products.map(product => (
              <div key={product._id} className="shop-product-card">
                <div className="shop-product-emoji">{product.emoji}</div>
                <div className="shop-product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="shop-product-footer">
                    <div className="shop-product-price">
                      ₹{product.pricePerUnit}
                      <span>/{product.unit}</span>
                    </div>
                    {cart[product._id] ? (
                      <div className="qty-ctrl">
                        <button onClick={() => removeFromCart(product._id)}>−</button>
                        <span>{cart[product._id].quantity}</span>
                        <button onClick={() => addToCart(product)}>+</button>
                      </div>
                    ) : (
                      <button
                        className="shop-add-btn"
                        onClick={() => addToCart(product)}
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating cart */}
      {cartCount > 0 && (
        <div className="shop-floating-cart" onClick={() => setShowCart(true)}>
          <span>🛒 {cartCount} items</span>
          <span className="sfc-total">₹{cartTotal}</span>
          <span>View Cart →</span>
        </div>
      )}

      {/* ======== CART DRAWER ======== */}
      {showCart && (
        <div className="drawer-overlay" onClick={() => setShowCart(false)}>
          <div className="shop-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-hdr">
              <h2>🛒 Your Cart</h2>
              <button onClick={() => setShowCart(false)}>✕</button>
            </div>

            {cartItems.length === 0 ? (
              <div className="drawer-empty">
                <div style={{ fontSize: 44 }}>🛒</div>
                <p>Cart is empty</p>
                <button onClick={() => setShowCart(false)}>
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                <div className="drawer-items">
                  {cartItems.map(item => (
                    <div key={item._id} className="drawer-item">
                      <span className="di-emoji">{item.emoji}</span>
                      <div className="di-info">
                        <div className="di-name">{item.name}</div>
                        <div className="di-price">
                          ₹{item.pricePerUnit} × {item.quantity}
                        </div>
                      </div>
                      <div className="qty-ctrl sm">
                        <button onClick={() => removeFromCart(item._id)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                      <div className="di-total">
                        ₹{item.pricePerUnit * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="drawer-footer">
                  <div className="drawer-total">
                    <span>Total</span>
                    <span className="dt-amount">₹{cartTotal}</span>
                  </div>
                  <div className="cod-pill">💵 Cash on Delivery Only</div>
                  <button
                    className="checkout-btn"
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                  >
                    Proceed to Checkout →
                  </button>
                  <button
                    className="clear-btn"
                    onClick={() => setCart({})}
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ======== CHECKOUT DRAWER ======== */}
      {showCheckout && (
        <div className="drawer-overlay" onClick={() => setShowCheckout(false)}>
          <div className="shop-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-hdr">
              <h2>📦 Checkout</h2>
              <button onClick={() => setShowCheckout(false)}>✕</button>
            </div>

            {/* Order summary */}
            <div className="co-summary">
              {cartItems.map(item => (
                <div key={item._id} className="co-item">
                  <span>{item.emoji} {item.name} × {item.quantity}</span>
                  <span>₹{item.pricePerUnit * item.quantity}</span>
                </div>
              ))}
              <div className="co-total">
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="cod-pill">💵 Cash on Delivery</div>
            </div>

            {/* Delivery form */}
            <form onSubmit={handlePlaceOrder} className="co-form">
              <h3>Delivery Details</h3>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  value={form.customerName}
                  onChange={e => setForm({...form, customerName: e.target.value})}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
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
                  placeholder="Mobile number"
                />
              </div>
              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea
                  value={form.deliveryAddress}
                  onChange={e => setForm({...form, deliveryAddress: e.target.value})}
                  placeholder="Full address with landmark"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <input
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Any special instructions"
                />
              </div>

              <button
                type="submit"
                className="place-btn"
                disabled={submitting}
              >
                {submitting
                  ? '⏳ Placing Order...'
                  : '✅ Place Order — Cash on Delivery'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======== SUCCESS ======== */}
      {showSuccess && (
        <div className="drawer-overlay">
          <div className="success-box">
            <div style={{ fontSize: 52 }}>🎉</div>
            <h2>Order Placed!</h2>
            <p>
              Thank you! We've received your order and will contact
              you to confirm delivery.
            </p>
            <div className="success-info">
              💵 Cash on Delivery<br/>
              📞 We'll call to confirm
            </div>
            <button
              className="checkout-btn"
              onClick={() => setShowSuccess(false)}
              style={{ marginTop: 16 }}
            >
              Continue Shopping
            </button>
            <button
              className="clear-btn"
              onClick={() => navigate('/customer/orders')}
              style={{ marginTop: 8 }}
            >
              View My Orders
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default ShopPage;
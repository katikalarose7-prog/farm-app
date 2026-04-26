// src/pages/ProductsAdminPage.jsx
import { useEffect, useState } from 'react';
import {
  getAllProducts, addProduct,
  updateProduct, deleteProduct
} from '../api/api';
import './ProductsAdminPage.css';

const EMOJIS = [
  '🥛','🥚','🍖','🥩','🍯','🌿','🍋','🍊','🥭',
  '🍇','🍌','🍅','🥬','🌾','🐑','🐟','🥜','🫙','📦'
];

const emptyForm = {
  name: '', description: '', emoji: '📦',
  unit: '', pricePerUnit: '', stock: '',
  minOrderQty: 1, published: false
};

function ProductsAdminPage() {
  const [products,  setProducts]  = useState([]);
  const [form,      setForm]      = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await getAllProducts();
      setProducts(res.data);
    } catch {
      alert('Could not load products.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const val = e.target.type === 'checkbox'
      ? e.target.checked
      : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  }

  function openEdit(product) {
    setForm({
      name:        product.name,
      description: product.description || '',
      emoji:       product.emoji,
      unit:        product.unit,
      pricePerUnit:product.pricePerUnit,
      stock:       product.stock,
      minOrderQty: product.minOrderQty || 1,
      published:   product.published
    });
    setEditingId(product._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.unit || !form.pricePerUnit) {
      return alert('Name, unit and price are required.');
    }
    try {
      const data = {
        ...form,
        pricePerUnit: Number(form.pricePerUnit),
        stock:        Number(form.stock) || 0,
        minOrderQty:  Number(form.minOrderQty) || 1,
      };

      if (editingId) {
        await updateProduct(editingId, data);
      } else {
        await addProduct(data);
      }
      handleCancel();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save product.');
    }
  }

  async function handleTogglePublish(product) {
    try {
      await updateProduct(product._id, { published: !product.published });
      fetchProducts();
    } catch {
      alert('Could not update product.');
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch {
      alert('Could not delete.');
    }
  }

  // Stock badge
  function StockBadge({ stock, minQty }) {
    if (stock === 0) {
      return <span className="stock-badge out">Out of stock</span>;
    }
    if (stock <= 5) {
      return <span className="stock-badge low">Low: {stock} left</span>;
    }
    return <span className="stock-badge ok">{stock} in stock</span>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🛒 Shop Products</h1>
        <button
          className="btn btn-primary"
          onClick={() => { handleCancel(); setShowForm(!showForm); }}
        >
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* ---- FORM ---- */}
      {showForm && (
        <div className="card form-card" style={{ marginBottom: 16 }}>
          <h2 className="section-title">
            {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
          </h2>
          <form onSubmit={handleSubmit}>

            {/* Emoji picker */}
            <div className="form-group">
              <label>Emoji</label>
              <div className="pap-emoji-picker">
                {EMOJIS.map(em => (
                  <button
                    key={em}
                    type="button"
                    className={`pap-emoji-btn ${form.emoji === em ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, emoji: em })}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Fresh Milk"
                />
              </div>
              <div className="form-group">
                <label>Unit *</label>
                <input
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  placeholder="e.g. liter, dozen, kg"
                />
              </div>
              <div className="form-group">
                <label>Price per unit (₹) *</label>
                <input
                  name="pricePerUnit"
                  type="number"
                  min="0"
                  value={form.pricePerUnit}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                />
              </div>
              <div className="form-group">
                <label>Stock (0 = unlimited)</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                />
              </div>
              <div className="form-group">
                <label>Minimum Order Qty</label>
                <input
                  name="minOrderQty"
                  type="number"
                  min="1"
                  value={form.minOrderQty}
                  onChange={handleChange}
                  placeholder="e.g. 6 for eggs"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short description for customers"
              />
            </div>

            {/* Published toggle */}
            <div className="pap-publish-toggle">
              <label className="pap-toggle-label">
                <input
                  type="checkbox"
                  name="published"
                  checked={form.published}
                  onChange={handleChange}
                />
                <span className="pap-toggle-text">
                  {form.published
                    ? '✅ Published — visible to customers'
                    : '⛔ Draft — hidden from customers'}
                </span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? '💾 Save Changes' : '✅ Add Product'}
              </button>
              <button type="button" className="btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---- PRODUCTS LIST ---- */}
      {loading ? (
        <p className="loading-text">Loading products...</p>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p>No products yet. Add your first product.</p>
        </div>
      ) : (
        <div className="pap-products-list">
          {products.map(product => (
            <div
              key={product._id}
              className={`pap-product-card ${!product.published ? 'draft' : ''}`}
            >
              <div className="pap-product-left">
                <div className="pap-product-emoji">{product.emoji}</div>
                <div className="pap-product-info">
                  <div className="pap-product-name">{product.name}</div>
                  <div className="pap-product-meta">
                    ₹{product.pricePerUnit} / {product.unit}
                    &nbsp;·&nbsp;
                    Min: {product.minOrderQty} {product.unit}
                  </div>
                  {product.description && (
                    <div className="pap-product-desc">{product.description}</div>
                  )}
                  <div className="pap-product-badges">
                    <StockBadge
                      stock={product.stock}
                      minQty={product.minOrderQty}
                    />
                    <span className={`publish-badge ${product.published ? 'pub' : 'draft'}`}>
                      {product.published ? '✅ Published' : '⛔ Draft'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pap-product-actions">
                {/* Publish toggle */}
                <button
                  className={`btn ${product.published ? 'btn-warning' : 'btn-primary'}`}
                  onClick={() => handleTogglePublish(product)}
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  {product.published ? '⛔ Unpublish' : '✅ Publish'}
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => openEdit(product)}
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(product._id, product.name)}
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsAdminPage;
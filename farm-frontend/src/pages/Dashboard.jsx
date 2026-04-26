// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getLivestockSummary, getTodayProduction,
  getWorkers, getMonthlyProfit,
  getLast7Days, getSettings,
  updateSettings, getRevenue
} from '../api/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const [livestock,    setLivestock]    = useState([]);
  const [today,        setToday]        = useState({ milkLiters: 0, eggsCount: 0 });
  const [workerCount,  setWorkerCount]  = useState(0);
  const [profit,       setProfit]       = useState(null);
  const [chartData,    setChartData]    = useState([]);
  const [revenue,      setRevenue]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [milkPrice,    setMilkPrice]    = useState(40);
  const [eggPrice,     setEggPrice]     = useState(6);
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const settingsRes = await getSettings();
      const mPrice = settingsRes.data.milkPrice;
      const ePrice = settingsRes.data.eggPrice;
      setMilkPrice(mPrice);
      setEggPrice(ePrice);

      const [liveRes, prodRes, workRes, profitRes, chartRes, revRes] =
        await Promise.all([
          getLivestockSummary(),
          getTodayProduction(),
          getWorkers(),
          getMonthlyProfit(mPrice, ePrice),
          getLast7Days(),
          getRevenue(),
        ]);

      setLivestock(liveRes.data);
      setToday(prodRes.data);
      setWorkerCount(workRes.data.length);
      setProfit(profitRes.data);
      setChartData(chartRes.data);
      setRevenue(revRes.data);
    } catch {
      setError('Could not load dashboard. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePrices() {
    if (milkPrice <= 0 || eggPrice <= 0) return;
    try {
      setSaving(true);
      await updateSettings({ milkPrice, eggPrice });
      const profitRes = await getMonthlyProfit(milkPrice, eggPrice);
      setProfit(profitRes.data);
      setSaveMsg('✅ Saved!');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch {
      setSaveMsg('❌ Could not save.');
    } finally {
      setSaving(false);
    }
  }

  const totalAnimals = livestock.reduce((s, i) => s + i.totalCount, 0);
  const EMOJI = { goat:'🐐', buffalo:'🐃', hen:'🐔', cow:'🐄', other:'🐾' };
  const profitColor = profit?.profit >= 0 ? '#2d6a4f' : '#e53e3e';
  const netRevenue  = (revenue?.totalRevenue || 0) - (profit?.totalExpenses || 0);

  if (loading) return (
    <div className="db-loading">
      <div className="db-spinner" />
      <p>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="db-page">

      {/* ---- PAGE HEADER ---- */}
      <div className="db-header">
        <div>
          <h1 className="db-title">🏠 Dashboard</h1>
          <p className="db-subtitle">
            Welcome back! Here's your farm overview.
          </p>
        </div>
      </div>

      {error && <div className="db-error">{error}</div>}

      {/* ---- STAT CARDS ---- */}
      <div className="db-stats">
        <div className="db-stat green">
          <div className="db-stat-icon">🐾</div>
          <div className="db-stat-val">{totalAnimals}</div>
          <div className="db-stat-lbl">Total Animals</div>
        </div>
        <div className="db-stat blue">
          <div className="db-stat-icon">🥛</div>
          <div className="db-stat-val">{today.milkLiters}L</div>
          <div className="db-stat-lbl">Milk Today</div>
        </div>
        <div className="db-stat yellow">
          <div className="db-stat-icon">🥚</div>
          <div className="db-stat-val">{today.eggsCount}</div>
          <div className="db-stat-lbl">Eggs Today</div>
        </div>
        <div className="db-stat red">
          <div className="db-stat-icon">💰</div>
          <div className="db-stat-val">
            ₹{profit?.totalExpenses?.toLocaleString() || 0}
          </div>
          <div className="db-stat-lbl">Monthly Expenses</div>
        </div>
        <div className="db-stat purple">
          <div className="db-stat-icon">👷</div>
          <div className="db-stat-val">{workerCount}</div>
          <div className="db-stat-lbl">Workers</div>
        </div>
      </div>

      {/* ---- ROW 1: Profit + Chart ---- */}
      <div className="db-row">

        {/* Profit card */}
        {profit && (
          <div className="db-card">
            <div className="db-card-title">📈 Profit & Loss</div>

            {/* Price inputs */}
            <div className="db-price-row">
              <div className="db-price-inp">
                <span>🥛</span>
                <input
                  type="number"
                  value={milkPrice}
                  min="1"
                  onChange={e => setMilkPrice(Number(e.target.value))}
                />
                <span>₹/L</span>
              </div>
              <div className="db-price-inp">
                <span>🥚</span>
                <input
                  type="number"
                  value={eggPrice}
                  min="1"
                  onChange={e => setEggPrice(Number(e.target.value))}
                />
                <span>₹/egg</span>
              </div>
              <button
                className="db-save-btn"
                onClick={handleSavePrices}
                disabled={saving}
              >
                {saving ? '⏳' : '💾 Save'}
              </button>
              {saveMsg && (
                <span className={`db-save-msg ${saveMsg.includes('✅') ? 'ok' : 'err'}`}>
                  {saveMsg}
                </span>
              )}
            </div>

            {/* P&L boxes */}
            <div className="db-pl-grid">
              <div className="db-pl-box income">
                <div className="db-pl-label">💚 Income</div>
                <div className="db-pl-value">
                  ₹{profit.totalIncome.toLocaleString()}
                </div>
                <div className="db-pl-sub">
                  Milk ₹{profit.milkIncome.toLocaleString()} +
                  Eggs ₹{profit.eggIncome.toLocaleString()}
                </div>
              </div>
              <div className="db-pl-box expense">
                <div className="db-pl-label">🔴 Expenses</div>
                <div className="db-pl-value">
                  ₹{profit.totalExpenses.toLocaleString()}
                </div>
                <div className="db-pl-sub">This month</div>
              </div>
              <div className="db-pl-box result"
                style={{ borderColor: profitColor }}>
                <div className="db-pl-label">
                  {profit.profit >= 0 ? '🟢 Profit' : '🔴 Loss'}
                </div>
                <div className="db-pl-value" style={{ color: profitColor }}>
                  {profit.profit >= 0 ? '+' : ''}
                  ₹{profit.profit.toLocaleString()}
                </div>
                <div className="db-pl-sub">Income − Expenses</div>
              </div>
            </div>
          </div>
        )}

        {/* 7-day chart */}
        <div className="db-card">
          <div className="db-card-title">📊 7-Day Production</div>
          {chartData.length === 0 ? (
            <div className="db-empty-chart">
              <p>No production data yet.</p>
              <Link to="/dashboard/production">Add entries →</Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#718096' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#718096' }} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 12
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="milk"
                  name="Milk (L)"
                  fill="#4299e1"
                  radius={[4,4,0,0]}
                />
                <Bar
                  dataKey="eggs"
                  name="Eggs"
                  fill="#ecc94b"
                  radius={[4,4,0,0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ---- ROW 2: Revenue + Livestock + Quick Actions ---- */}
      <div className="db-row">

        {/* Revenue card */}
        {revenue && (
          <div className="db-card">
            <div className="db-card-title">💰 Revenue Dashboard</div>
            <p className="db-rev-note">From delivered orders only</p>

            <div className="db-rev-grid">
              <div className="db-rev-box">
                <div className="db-rev-icon">🚚</div>
                <div className="db-rev-val">
                  ₹{revenue.totalRevenue.toLocaleString()}
                </div>
                <div className="db-rev-lbl">Delivered Revenue</div>
              </div>
              <div className="db-rev-box">
                <div className="db-rev-icon">📦</div>
                <div className="db-rev-val">{revenue.deliveredCount}</div>
                <div className="db-rev-lbl">Orders Delivered</div>
              </div>
              <div className={`db-rev-box ${netRevenue >= 0 ? 'highlight' : 'highlight-red'}`}>
                <div className="db-rev-icon">
                  {netRevenue >= 0 ? '📈' : '📉'}
                </div>
                <div
                  className="db-rev-val"
                  style={{ color: netRevenue >= 0 ? '#2d6a4f' : '#e53e3e' }}
                >
                  {netRevenue >= 0 ? '+' : ''}
                  ₹{netRevenue.toLocaleString()}
                </div>
                <div className="db-rev-lbl">Net (Revenue − Expenses)</div>
              </div>
            </div>

            {/* Monthly bars */}
            {Object.keys(revenue.monthlyRevenue || {}).length > 0 && (
              <div className="db-monthly">
                <div className="db-monthly-title">Monthly Breakdown</div>
                {Object.entries(revenue.monthlyRevenue)
                  .slice(-4)
                  .reverse()
                  .map(([month, amount]) => {
                    const max = Math.max(
                      ...Object.values(revenue.monthlyRevenue)
                    );
                    return (
                      <div key={month} className="db-month-row">
                        <span className="db-month-label">{month}</span>
                        <div className="db-month-bar-bg">
                          <div
                            className="db-month-bar"
                            style={{ width: `${Math.round((amount/max)*100)}%` }}
                          />
                        </div>
                        <span className="db-month-amt">
                          ₹{amount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                }
              </div>
            )}
          </div>
        )}

        {/* Right column — Livestock + Quick Actions */}
        <div className="db-col">

          {/* Livestock breakdown */}
          <div className="db-card">
            <div className="db-card-title">🐄 Livestock Breakdown</div>
            {livestock.length === 0 ? (
              <p className="db-empty-text">
                No animals yet.{' '}
                <Link to="/dashboard/livestock">Add animals →</Link>
              </p>
            ) : (
              <div className="db-animal-list">
                {livestock.map(item => (
                  <div key={item._id} className="db-animal-row">
                    <span className="db-animal-emoji">
                      {EMOJI[item._id] || '🐾'}
                    </span>
                    <span className="db-animal-type">{item._id}</span>
                    <div className="db-animal-bar-wrap">
                      <div
                        className="db-animal-bar"
                        style={{
                          width: `${Math.round((item.totalCount / totalAnimals) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="db-animal-count">
                      {item.totalCount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="db-card">
            <div className="db-card-title">⚡ Quick Actions</div>
            <div className="db-quick-grid">
              <Link to="/dashboard/production" className="db-quick-btn">
                <span>🥛</span>
                <span>Add Production</span>
              </Link>
              <Link to="/dashboard/livestock" className="db-quick-btn">
                <span>🐐</span>
                <span>Livestock</span>
              </Link>
              <Link to="/dashboard/workers" className="db-quick-btn">
                <span>👷</span>
                <span>Attendance</span>
              </Link>
              <Link to="/dashboard/expenses" className="db-quick-btn">
                <span>💰</span>
                <span>Add Expense</span>
              </Link>
              <Link to="/dashboard/orders" className="db-quick-btn">
                <span>📦</span>
                <span>Orders</span>
              </Link>
              <Link to="/dashboard/products" className="db-quick-btn">
                <span>🛒</span>
                <span>Products</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Dashboard;
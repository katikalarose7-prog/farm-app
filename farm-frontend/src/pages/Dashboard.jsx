// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

import {
  getLivestockSummary,
  getTodayProduction,
  getWorkers,
  getMonthlyProfit,
  getLast7Days,
} from '../api/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const { t, lang, setLang} = useTranslation();
  const [livestock,     setLivestock]     = useState([]);
  const [today,         setToday]         = useState({ milkLiters: 0, eggsCount: 0 });
  const [workerCount,   setWorkerCount]   = useState(0);
  const [profit,        setProfit]        = useState(null);
  const [chartData,     setChartData]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  // Price settings — farmer can adjust these
  const [milkPrice, setMilkPrice] = useState(40);
  const [eggPrice,  setEggPrice]  = useState(6);

  useEffect(() => { loadDashboard(); }, [milkPrice, eggPrice]);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [liveRes, prodRes, workRes, profitRes, chartRes] = await Promise.all([
        getLivestockSummary(),
        getTodayProduction(),
        getWorkers(),
        getMonthlyProfit(milkPrice, eggPrice),
        getLast7Days(),
      ]);
      setLivestock(liveRes.data);
      setToday(prodRes.data);
      setWorkerCount(workRes.data.length);
      setProfit(profitRes.data);
      setChartData(chartRes.data);
    } catch (err) {
      setError('Could not load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  const totalAnimals = livestock.reduce((sum, item) => sum + item.totalCount, 0);
  const animalEmoji  = { goat:'🐐', buffalo:'🐃', hen:'🐔', cow:'🐄', other:'🐾' };

  const profitColor = profit?.profit >= 0 ? '#2d6a4f' : '#e53e3e';

  if (loading) return (
    <div className="page">
      <p className="loading-text">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">🏠 {t("dashboard")}</h1>

      {error && <div className="error-box">{error}</div>}

      {/* ---- STAT CARDS ---- */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-icon">🐾</div>
          <div className="stat-value">{totalAnimals}</div>
          <div className="stat-label">Total Animals</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">🥛</div>
          <div className="stat-value">{today.milkLiters}L</div>
          <div className="stat-label">Milk Today</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon">🥚</div>
          <div className="stat-value">{today.eggsCount}</div>
          <div className="stat-label">Eggs Today</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">💰</div>
          <div className="stat-value">
            ₹{profit?.totalExpenses?.toLocaleString() || 0}
          </div>
          <div className="stat-label">Monthly Expenses</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">👷</div>
          <div className="stat-value">{workerCount}</div>
          <div className="stat-label">Workers</div>
        </div>
      </div>

      {/* ---- PROFIT CALCULATOR ---- */}
      {profit && (
        <div className="card profit-card">
          <h2 className="section-title">📈 This Month's Profit & Loss</h2>

          {/* Price inputs — farmer sets their sale prices */}
          <div className="price-inputs">
            <div className="price-input-group">
              <label>🥛 Milk price per litre (₹)</label>
              <input
                type="number"
                value={milkPrice}
                min="1"
                onChange={e => setMilkPrice(Number(e.target.value))}
              />
            </div>
            <div className="price-input-group">
              <label>🥚 Egg price each (₹)</label>
              <input
                type="number"
                value={eggPrice}
                min="1"
                onChange={e => setEggPrice(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Income / Expense / Profit row */}
          <div className="profit-grid">
            <div className="profit-box income">
              <div className="profit-box-label">💚 Total Income</div>
              <div className="profit-box-value">
                ₹{profit.totalIncome.toLocaleString()}
              </div>
              <div className="profit-box-sub">
                Milk: ₹{profit.milkIncome.toLocaleString()} &nbsp;|&nbsp;
                Eggs: ₹{profit.eggIncome.toLocaleString()}
              </div>
            </div>

            <div className="profit-box expense">
              <div className="profit-box-label">🔴 Total Expenses</div>
              <div className="profit-box-value">
                ₹{profit.totalExpenses.toLocaleString()}
              </div>
              <div className="profit-box-sub">This month</div>
            </div>

            <div className="profit-box result" style={{ borderColor: profitColor }}>
              <div className="profit-box-label">
                {profit.profit >= 0 ? '🟢 Net Profit' : '🔴 Net Loss'}
              </div>
              <div className="profit-box-value" style={{ color: profitColor }}>
                {profit.profit >= 0 ? '+' : ''}₹{profit.profit.toLocaleString()}
              </div>
              <div className="profit-box-sub">Income − Expenses</div>
            </div>
          </div>
        </div>
      )}

      {/* ---- 7-DAY CHART ---- */}
      <div className="card">
        <h2 className="section-title">📊 Last 7 Days Production</h2>
        {chartData.length === 0 ? (
          <p className="empty-text">
            No production data yet.{' '}
            <Link to="/production">Add entries →</Link>
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#718096' }}
              />
              <YAxis tick={{ fontSize: 12, fill: '#718096' }} />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="milk" name="Milk (L)"  fill="#4299e1" radius={[4,4,0,0]} />
              <Bar dataKey="eggs" name="Eggs"      fill="#ecc94b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ---- LIVESTOCK BREAKDOWN ---- */}
      <div className="card">
        <h2 className="section-title">🐄 Livestock Breakdown</h2>
        {livestock.length === 0 ? (
          <p className="empty-text">
            No animals added yet.{' '}
            <Link to="/livestock">Add animals →</Link>
          </p>
        ) : (
          <div className="animal-list">
            {livestock.map(item => (
              <div key={item._id} className="animal-row">
                <span className="animal-emoji">
                  {animalEmoji[item._id] || '🐾'}
                </span>
                <span className="animal-type">{item._id}</span>
                <span className="animal-count">{item.totalCount} animals</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- QUICK LINKS ---- */}
      <div className="card">
        <h2 className="section-title">⚡ Quick Actions</h2>
        <div className="quick-links">
          <Link to="/production" className="quick-btn">🥛 Add Today's Production</Link>
          <Link to="/livestock"  className="quick-btn">🐐 Manage Animals</Link>
          <Link to="/workers"    className="quick-btn">👷 Mark Attendance</Link>
          <Link to="/expenses"   className="quick-btn">💰 Add Expense</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
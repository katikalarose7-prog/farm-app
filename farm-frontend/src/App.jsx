// src/App.jsx
// This is the ROOT of our React app.
// React Router looks at the URL and shows the right page.

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages (we'll create these one by one)
import Dashboard   from './pages/Dashboard';
import LivestockPage  from './pages/LivestockPage';
import ProductionPage from './pages/ProductionPage';
import WorkersPage    from './pages/WorkersPage';
import ExpensesPage   from './pages/ExpensesPage';
// Navbar shown on every page
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Dashboard />} />
        <Route path="/livestock"  element={<LivestockPage />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/workers"    element={<WorkersPage />} />
        <Route path="/expenses"   element={<ExpensesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
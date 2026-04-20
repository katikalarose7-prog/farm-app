// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import ProtectedRoute  from './components/ProtectedRoute';
import Navbar          from './components/Navbar';
import LoginPage       from './pages/LoginPage';
import Dashboard       from './pages/Dashboard';
import LivestockPage   from './pages/LivestockPage';
import ProductionPage  from './pages/ProductionPage';
import WorkersPage     from './pages/WorkersPage';
import ExpensesPage    from './pages/ExpensesPage';

function App() {
  return (
    // AuthProvider wraps everything so ALL components can read auth state
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public route — no login needed */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — login required */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Navbar />
              <Routes>
                <Route path="/"           element={<Dashboard />} />
                <Route path="/livestock"  element={<LivestockPage />} />
                <Route path="/production" element={<ProductionPage />} />
                <Route path="/workers"    element={<WorkersPage />} />
                <Route path="/expenses"   element={<ExpensesPage />} />
              </Routes>
            </ProtectedRoute>
          }/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }         from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import ProtectedRoute           from './components/ProtectedRoute';
import CustomerProtectedRoute   from './components/CustomerProtectedRoute';
import Navbar                   from './components/Navbar';

// Public
import LandingPage       from './pages/LandingPage';

// Customer
import CustomerLoginPage from './pages/customer/CustomerLoginPage';
import ShopPage          from './pages/customer/ShopPage';
import MyOrdersPage      from './pages/customer/MyOrdersPage';

// Admin
import LoginPage          from './pages/LoginPage';
import Dashboard          from './pages/Dashboard';
import LivestockPage      from './pages/LivestockPage';
import ProductionPage     from './pages/ProductionPage';
import WorkersPage        from './pages/WorkersPage';
import ExpensesPage       from './pages/ExpensesPage';
import OrdersPage         from './pages/OrdersPage';
import UsersPage          from './pages/UsersPage';
import ProductsAdminPage  from './pages/ProductsAdminPage';

function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <BrowserRouter>
          <Routes>

            {/* ---- PUBLIC ---- */}
            <Route path="/"      element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />}   />

            {/* ---- CUSTOMER ---- */}
            <Route
              path="/customer/login"
              element={<CustomerLoginPage />}
            />
            <Route
              path="/customer/shop"
              element={
                <CustomerProtectedRoute>
                  <ShopPage />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="/customer/orders"
              element={
                <CustomerProtectedRoute>
                  <MyOrdersPage />
                </CustomerProtectedRoute>
              }
            />

            {/* ---- ADMIN DASHBOARD ---- */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <Navbar />
                <Routes>
                  <Route path="/"           element={<Dashboard />}          />
                  <Route path="/livestock"  element={<LivestockPage />}      />
                  <Route path="/production" element={<ProductionPage />}     />
                  <Route path="/products"   element={<ProductsAdminPage />}  />
                  <Route path="/workers"    element={<WorkersPage />}        />
                  <Route path="/expenses"   element={<ExpensesPage />}       />
                  <Route path="/orders"     element={<OrdersPage />}         />
                  <Route path="/users"      element={<UsersPage />}          />
                </Routes>
              </ProtectedRoute>
            }/>

          </Routes>
        </BrowserRouter>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}

export default App;
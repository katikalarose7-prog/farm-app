// src/components/ProtectedRoute.jsx
// Wrap any page with this to make it login-required

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking localStorage — show nothing yet
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', fontSize: '18px', color: '#718096' }}>
        Loading...
      </div>
    );
  }

  // Not logged in — redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in — show the page
  return children;
}

export default ProtectedRoute;
// src/components/CustomerProtectedRoute.jsx
import { Navigate }        from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';

function CustomerProtectedRoute({ children }) {
  const { customer, loading } = useCustomerAuth();

  if (loading) {
    return (
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '100vh',
        flexDirection:  'column',
        gap:            12,
        background:     '#f5f7f2'
      }}>
        <div style={{
          width:          40,
          height:         40,
          border:         '4px solid #e2e8f0',
          borderTopColor: '#2d6a4f',
          borderRadius:   '50%',
          animation:      'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#718096', fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/customer/login" replace />;
  }

  return children;
}

export default CustomerProtectedRoute;
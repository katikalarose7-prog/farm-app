// src/components/AdminOnly.jsx
// Wrap any button/form/action with this to hide it from guests
// Usage: <AdminOnly><button>Delete</button></AdminOnly>
// Optional fallback: <AdminOnly fallback={<span>View only</span>}>

import { useAuth } from '../context/AuthContext';

function AdminOnly({ children, fallback = null }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : fallback;
}

export default AdminOnly;
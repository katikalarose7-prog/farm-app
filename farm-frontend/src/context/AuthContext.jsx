// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('farmUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      }
    } catch {
      localStorage.removeItem('farmUser');
    } finally {
      setLoading(false);
    }
  }, []);

  function saveUser(userData) {
    setUser(userData);
    localStorage.setItem('farmUser', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('farmUser');
    delete axios.defaults.headers.common['Authorization'];
  }

  // ---- Role helpers ---- 
  // Use these anywhere: const { isAdmin } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isGuest = user?.role === 'guest';

  return (
    <AuthContext.Provider value={{
      user, loading, saveUser, logout,
      isAdmin, isGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage BEFORE rendering anything
    try {
      const stored = localStorage.getItem('farmUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.token) {
          setUser(parsed);
          // Set axios header immediately
          api.defaults.headers.common['Authorization'] =
            `Bearer ${parsed.token}`;
        }
      }
    } catch {
      localStorage.removeItem('farmUser');
    } finally {
      setLoading(false); // Always stop loading
    }
  }, []);

  function saveUser(userData) {
    setUser(userData);
    localStorage.setItem('farmUser', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] =
      `Bearer ${userData.token}`;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('farmUser');
    delete api.defaults.headers.common['Authorization'];
  }

  const isAdmin = user?.role === 'admin';
  const isGuest = user?.role === 'guest';

  return (
    <AuthContext.Provider value={{
      user, loading, saveUser, logout, isAdmin, isGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
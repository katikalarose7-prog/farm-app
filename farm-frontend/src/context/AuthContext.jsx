// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true while checking localStorage

  // On app load — check if user was already logged in
  useEffect(() => {
    const stored = localStorage.getItem('farmUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      // Set axios default header so all requests include the token
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);

  // Called after successful login or register
  function saveUser(userData) {
    setUser(userData);
    localStorage.setItem('farmUser', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  }

  // Called on logout
  function logout() {
    setUser(null);
    localStorage.removeItem('farmUser');
    delete axios.defaults.headers.common['Authorization'];
  }

  return (
    <AuthContext.Provider value={{ user, loading, saveUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component
export function useAuth() {
  return useContext(AuthContext);
}
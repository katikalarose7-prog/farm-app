// src/context/CustomerAuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CustomerAuthContext = createContext();

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('farmCustomer');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.token) {
          setCustomer(parsed);
        }
      }
    } catch {
      localStorage.removeItem('farmCustomer');
    } finally {
      setLoading(false);
    }
  }, []);

  function saveCustomer(data) {
    setCustomer(data);
    localStorage.setItem('farmCustomer', JSON.stringify(data));
  }

  function logoutCustomer() {
    setCustomer(null);
    localStorage.removeItem('farmCustomer');
  }

  return (
    <CustomerAuthContext.Provider value={{
      customer, loading, saveCustomer, logoutCustomer
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext);
}
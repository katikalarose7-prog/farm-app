// src/api/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create one axios instance for everything
const api = axios.create({
  baseURL: BASE_URL
});

// ONE single interceptor — checks both admin and customer tokens
api.interceptors.request.use((config) => {
  try {
    const farmUser   = JSON.parse(localStorage.getItem('farmUser')   || 'null');
    const farmCustomer = JSON.parse(localStorage.getItem('farmCustomer') || 'null');

    // Customer token takes priority on customer pages, admin on dashboard
    const token = farmCustomer?.token || farmUser?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

// ---- LIVESTOCK ----
export const getLivestock        = ()         => api.get('/livestock');
export const getLivestockSummary = ()         => api.get('/livestock/summary');
export const addLivestock        = (data)     => api.post('/livestock', data);
export const updateLivestock     = (id, data) => api.put(`/livestock/${id}`, data);
export const deleteLivestock     = (id)       => api.delete(`/livestock/${id}`);

// ---- PRODUCTION ----
export const getProduction      = ()     => api.get('/production');
export const getTodayProduction = ()     => api.get('/production/today');
export const addProduction      = (data) => api.post('/production', data);
export const deleteProduction   = (id)   => api.delete(`/production/${id}`);
export const getLast7Days       = ()     => api.get('/production/last7days');

// ---- WORKERS ----
export const getWorkers     = ()             => api.get('/workers');
export const addWorker      = (data)         => api.post('/workers', data);
export const updateWorker   = (id, data)     => api.put(`/workers/${id}`, data);
export const deleteWorker   = (id)           => api.delete(`/workers/${id}`);
export const markAttendance = (id, data)     => api.post(`/workers/${id}/attendance`, data);

// ---- EXPENSES ----
export const getExpenses     = ()     => api.get('/expenses');
export const getMonthlyTotal = ()     => api.get('/expenses/monthly-total');
export const addExpense      = (data) => api.post('/expenses', data);
export const deleteExpense   = (id)   => api.delete(`/expenses/${id}`);

// ---- PROFIT ----
export const getMonthlyProfit = (milkPrice, eggPrice) =>
  api.get(`/profit?milkPrice=${milkPrice}&eggPrice=${eggPrice}`);

// ---- SETTINGS ----
export const getSettings    = ()     => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);

// ---- PRODUCTION CATEGORIES ----
export const getCategories  = ()     => api.get('/categories');
export const addCategory    = (data) => api.post('/categories', data);
export const deleteCategory = (id)   => api.delete(`/categories/${id}`);

// ---- PRODUCTS ----
export const getProducts   = ()         => api.get('/products');
export const getAllProducts = ()         => api.get('/products/all');
export const addProduct    = (data)     => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

// ---- ORDERS ----
export const placeOrder        = (data)       => api.post('/orders', data);
export const getAllOrders       = ()           => api.get('/orders');
export const getUnreadCount    = ()           => api.get('/orders/unread-count');
export const markAllRead       = ()           => api.put('/orders/mark-all-read');
export const markOrderRead     = (id)         => api.put(`/orders/${id}/read`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const getMyOrders       = ()           => api.get('/orders/mine');

// ---- CUSTOMER AUTH ----
export const customerRegister = (data) => api.post('/auth/customer/register', data);
export const customerLogin    = (data) => api.post('/auth/customer/login', data);
export const updateProfile    = (data) => api.put('/auth/profile', data);

export default api;
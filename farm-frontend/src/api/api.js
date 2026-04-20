import axios from "axios";

// Base URL (local or production)
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL
});

// 🔐 AUTO ATTACH JWT TOKEN
/*api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});*/

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("farmUser"));

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default api;

export const getLivestock = () => api.get("/livestock");

export const getLivestockSummary = () =>
  api.get("/livestock/summary");

export const addLivestock = (data) =>
  api.post("/livestock", data);

export const updateLivestock = (id, data) =>
  api.put(`/livestock/${id}`, data);

export const deleteLivestock = (id) =>
  api.delete(`/livestock/${id}`);

export const getProduction = () =>
  api.get("/production");

export const getTodayProduction = () =>
  api.get("/production/today");

export const addProduction = (data) =>
  api.post("/production", data);

export const deleteProduction = (id) =>
  api.delete(`/production/${id}`);

export const getLast7Days = () =>
  api.get("/production/last7days");


export const getWorkers = () =>
  api.get("/workers");

export const addWorker = (data) =>
  api.post("/workers", data);

export const updateWorker = (id, data) =>
  api.put(`/workers/${id}`, data);

export const deleteWorker = (id) =>
  api.delete(`/workers/${id}`);

export const markAttendance = (id, data) =>
  api.post(`/workers/${id}/attendance`, data);


export const getExpenses = () =>
  api.get("/expenses");

export const getMonthlyTotal = () =>
  api.get("/expenses/monthly-total");

export const addExpense = (data) =>
  api.post("/expenses", data);

export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}`);


export const getMonthlyProfit = (milkPrice, eggPrice) =>
  api.get(
    `/profit?milkPrice=${milkPrice}&eggPrice=${eggPrice}`
  );
// src/api/api.js
// All backend API calls live here. 
// If your backend URL ever changes, you only update it in ONE place.

import axios from 'axios';

//const BASE_URL = 'http://localhost:5000/api';


// To this (use your actual Render URL):
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ---- LIVESTOCK ----
export const getLivestock     = ()         => axios.get(`${BASE_URL}/livestock`);
export const getLivestockSummary = ()      => axios.get(`${BASE_URL}/livestock/summary`);
export const addLivestock     = (data)     => axios.post(`${BASE_URL}/livestock`, data);
export const updateLivestock  = (id, data) => axios.put(`${BASE_URL}/livestock/${id}`, data);
export const deleteLivestock  = (id)       => axios.delete(`${BASE_URL}/livestock/${id}`);

// ---- PRODUCTION ----
export const getProduction      = ()     => axios.get(`${BASE_URL}/production`);
export const getTodayProduction = ()     => axios.get(`${BASE_URL}/production/today`);
export const addProduction      = (data) => axios.post(`${BASE_URL}/production`, data);
export const deleteProduction   = (id)   => axios.delete(`${BASE_URL}/production/${id}`);

// ---- WORKERS ----
export const getWorkers      = ()             => axios.get(`${BASE_URL}/workers`);
export const addWorker       = (data)         => axios.post(`${BASE_URL}/workers`, data);
export const updateWorker    = (id, data)     => axios.put(`${BASE_URL}/workers/${id}`, data);
export const deleteWorker    = (id)           => axios.delete(`${BASE_URL}/workers/${id}`);
export const markAttendance  = (id, data)     => axios.post(`${BASE_URL}/workers/${id}/attendance`, data);

// ---- EXPENSES ----
export const getExpenses     = ()     => axios.get(`${BASE_URL}/expenses`);
export const getMonthlyTotal = ()     => axios.get(`${BASE_URL}/expenses/monthly-total`);
export const addExpense      = (data) => axios.post(`${BASE_URL}/expenses`, data);
export const deleteExpense   = (id)   => axios.delete(`${BASE_URL}/expenses/${id}`);

// ---- PROFIT & CHARTS ----
export const getMonthlyProfit = (milkPrice, eggPrice) =>
  axios.get(`${BASE_URL}/profit?milkPrice=${milkPrice}&eggPrice=${eggPrice}`);

export const getLast7Days = () =>
  axios.get(`${BASE_URL}/production/last7days`);
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e.response?.data?.message || 'Something went wrong. Try again.';
export const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default api;

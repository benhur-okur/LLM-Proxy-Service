// app/frontend/src/axios.js
import axios from 'axios';

// src/axios.js
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 2000,
});

export default api;
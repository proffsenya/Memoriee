import axios from 'axios';

// Базовый URL с префиксом /api
const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
    console.log('Unauth', error.response.data);
        //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
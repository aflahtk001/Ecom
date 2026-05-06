import axios from 'axios';

// This is the central point for all API calls.
// When you host the backend, simply change the URL in your .env file or here.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Automatically attach the Auth token if it exists in Redux/localStorage
api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo?.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export default api;
export { API_URL };

import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Backend NestJS TransformInterceptor wraps responses as { statusCode, data, message }
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra';
    return Promise.reject(new Error(message));
  },
);

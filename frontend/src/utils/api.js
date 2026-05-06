import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => apiClient.post('/api/auth/signup', data),
  login: (data) => apiClient.post('/api/auth/login', data),
  refresh: () => apiClient.post('/api/auth/refresh'),
};

export const userAPI = {
  getProfile: () => apiClient.get('/api/users/profile'),
  updateProfile: (data) => apiClient.put('/api/users/profile', data),
};

export const emotionAPI = {
  detect: (text) => apiClient.post('/api/emotions/detect', { text }),
  record: (data) => apiClient.post('/api/emotions/record', data),
  detectFace: (image) => apiClient.post('/api/emotions/detect-face', { image }),
  getStatus: () => apiClient.get('/api/emotions/status'),
};

export const journalAPI = {
  create: (data) => apiClient.post('/api/journal/create', data),
  list: (params) => apiClient.get('/api/journal/list', { params }),
  get: (id) => apiClient.get(`/api/journal/${id}`),
};

export const interventionAPI = {
  getRecommendations: (params) => apiClient.get('/api/interventions/recommend', { params }),
  trigger: (type, data) => apiClient.post(`/api/interventions/trigger/${type}`, data),
  feedback: (id, data) => apiClient.post(`/api/interventions/feedback/${id}`, data),
};

export const analyticsAPI = {
  getDailyScore: (params) => apiClient.get('/api/analytics/daily-score', { params }),
  getInsights: (params) => apiClient.get('/api/analytics/insights', { params }),
  getDashboard: (params) => apiClient.get('/api/analytics/summary', { params }),
};

export default apiClient;

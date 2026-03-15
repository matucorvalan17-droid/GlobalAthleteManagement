import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const portfolioAPI = {
  getSummary: () => api.get('/portfolio'),
  getHistory: () => api.get('/portfolio/history'),
  getAssets: () => api.get('/portfolio/assets'),
};

export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  getByAsset: (assetId) => api.get(`/transactions/asset/${assetId}`),
  create: (data) => api.post('/transactions', data),
  delete: (id) => api.delete(`/transactions/${id}`),
  importCSV: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/transactions/import-csv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const pricesAPI = {
  searchAsset: (q, type) => api.get(`/prices/search?q=${q}&type=${type}`),
};

export default api;

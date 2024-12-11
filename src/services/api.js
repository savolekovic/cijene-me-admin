import axios from 'axios';

// Use proxy path in all environments
export const BASE_URL = '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Initialize auth header from localStorage on app start
const auth = JSON.parse(localStorage.getItem('auth') || '{}');
if (auth.accessToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${auth.accessToken}`;
}

// Add response interceptor for debugging
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        if (!auth.refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/refresh', {
          refresh_token: auth.refreshToken
        });

        const { access_token, refresh_token } = response.data;
        
        // Update localStorage and headers
        const newAuth = { accessToken: access_token, refreshToken: refresh_token };
        localStorage.setItem('auth', JSON.stringify(newAuth));
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        processQueue(null, access_token);
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('auth');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}; 
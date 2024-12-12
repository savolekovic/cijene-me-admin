import axios from 'axios';
import axiosRetry from 'axios-retry';

// Use proxy path in all environments
export const BASE_URL = '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Configure axios-retry
axiosRetry(api, { 
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Log the error for debugging
    console.log('Retry condition error:', {
      status: error.response?.status,
      data: error.response?.data,
      isIdempotent: axiosRetry.isNetworkOrIdempotentRequestError(error)
    });

    // Only retry on network errors and 500s, not on 400s or redirects
    return error.response?.status === 500 || 
           (error.code && ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED'].includes(error.code));
  },
  // Add retry delay logging
  onRetry: (retryCount, error, requestConfig) => {
    console.log(`Retry attempt ${retryCount} for ${requestConfig.url}`);
  }
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

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  // Log the full request details
  console.log('Request Details:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    baseURL: request.baseURL
  });
  return request;
});

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
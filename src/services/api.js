import axios from 'axios';
import axiosRetry from 'axios-retry';

export const BASE_URL = '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
); 

// Configure axios-retry
axiosRetry(api, {
  retries: 3, // Number of retry attempts
  retryDelay: (retryCount) => {
    console.log(`Retry attempt: ${retryCount}`);
    return axiosRetry.exponentialDelay(retryCount);
  },
  retryCondition: (error) => {
    // Only retry on 500 errors
    return error.response?.status === 500;
  },
  onRetry: (retryCount, error, requestConfig) => {
    console.log('Retrying request:', {
      attempt: retryCount,
      url: requestConfig.url,
      method: requestConfig.method,
      error: error.message
    });
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
  // Construct full URL
  const fullUrl = request.baseURL 
    ? new URL(request.url, request.baseURL.startsWith('http') ? request.baseURL : `https://${window.location.host}${request.baseURL}`).href
    : request.url;

  // Log full request details
  console.log('Full Request Details:', {
    fullUrl,
    baseURL: request.baseURL,
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
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
        // Dispatch an event to notify about authentication failure
        window.dispatchEvent(new CustomEvent('auth-error', { detail: refreshError }));
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
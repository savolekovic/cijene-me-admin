import axios, { InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';

export const BASE_URL = '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Create a separate instance for multipart/form-data requests
export const uploadApi = axios.create({
  baseURL: BASE_URL,
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

// Add the same response interceptor to uploadApi
uploadApi.interceptors.response.use(
  (response) => {
    console.log('Upload API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    // Detailed error logging
    console.error('Upload API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
      message: error.message
    });
    
    // Log the complete error response data separately
    console.error('Complete error response data:', error.response?.data);

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return uploadApi(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const access_token = await refreshAuthToken();
        processQueue(null, access_token);
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return uploadApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('auth');
        window.dispatchEvent(new CustomEvent('auth-error', { detail: refreshError }));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

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
interface QueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
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
  uploadApi.defaults.headers.common['Authorization'] = `Bearer ${auth.accessToken}`;
}

// Add request interceptor for debugging
api.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  // Don't modify Content-Type if it's FormData
  if (!(request.data instanceof FormData)) {
    request.headers.set('Content-Type', 'application/json');
  }

  // Construct full URL
  const fullUrl = request.baseURL && request.url
    ? new URL(request.url, request.baseURL.startsWith('http') ? request.baseURL : `https://${window.location.host}${request.baseURL}`).href
    : request.url || '';

  // Log full request details
  console.log('Full Request Details:', {
    fullUrl,
    baseURL: request.baseURL,
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data instanceof FormData ? 'FormData' : request.data
  });
  return request;
});

// Add request interceptor for debugging
uploadApi.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  console.log('Starting uploadApi request interceptor');
  
  if (request.data instanceof FormData) {
    // Remove any Content-Type header to let the browser set it
    delete request.headers['Content-Type'];
    
    // Debug log FormData contents
    const entries = Array.from(request.data.entries());
    console.log('FormData contents:', entries.map(([key, value]) => ({
      key,
      type: value instanceof File ? `File (${value.type})` : typeof value,
      value: value instanceof File ? `${value.name} (${value.size} bytes)` : value
    })));
  }

  // Add Authorization header from localStorage
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  if (auth.accessToken) {
    request.headers['Authorization'] = `Bearer ${auth.accessToken}`;
  }

  return request;
});

// Shared token refresh function
const refreshAuthToken = async () => {
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
  uploadApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

  return access_token;
};

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
        const access_token = await refreshAuthToken();
        processQueue(null, access_token);
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('auth');
        window.dispatchEvent(new CustomEvent('auth-error', { detail: refreshError }));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Add the same refresh token interceptor to uploadApi
uploadApi.interceptors.response.use(
  response => response,
  async error => {
    // Detailed error logging
    console.error('Upload API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
      message: error.message
    });
    
    // Log the complete error response data separately
    console.error('Complete error response data:', error.response?.data);

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return uploadApi(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const access_token = await refreshAuthToken();
        processQueue(null, access_token);
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        return uploadApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('auth');
        window.dispatchEvent(new CustomEvent('auth-error', { detail: refreshError }));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    uploadApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
    delete uploadApi.defaults.headers.common['Authorization'];
  }
}; 

// Helper function to create FormData from an object
export const createFormData = (data: Record<string, any>, file: File | null = null, fileField: string = 'image'): FormData => {
  console.log('Creating FormData with:', { data, file });
  const formData = new FormData();
  
  // Add all non-file fields one by one
  formData.append('name', data.name);
  formData.append('barcode', data.barcode);
  formData.append('category_id', String(data.category_id));
  
  // Add file if provided
  if (file) {
    formData.append('image', file);
  }

  // Debug log FormData contents
  console.log('FormData contents:');
  console.log('Fields:');
  Array.from(formData.entries()).forEach(([key, value]) => {
    if (value instanceof File) {
      console.log(`${key}: File(name=${value.name}, type=${value.type}, size=${value.size})`);
    } else {
      console.log(`${key}: ${value}`);
    }
  });
  
  // Log raw FormData entries
  const entries = Array.from(formData.entries());
  console.log('Raw FormData entries:', entries);
  
  // Verify FormData structure
  console.log('FormData verification:');
  console.log('Number of entries:', entries.length);
  console.log('Keys present:', entries.map(([key]) => key));
  console.log('Types of values:', entries.map(([_, value]) => value instanceof File ? 'File' : typeof value));
  
  return formData;
}; 
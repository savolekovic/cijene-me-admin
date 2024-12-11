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

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', request)
  return request
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
      console.log('Response:', response)
      return response
  },
  error => {
      console.error('Response Error:', error.response || error)
      return Promise.reject(error)
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}; 
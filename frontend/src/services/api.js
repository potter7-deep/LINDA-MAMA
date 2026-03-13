import axios from 'axios';

// Determine the base URL based on environment
// In development: uses proxy (relative URL)
// In production: use the actual backend URL
const getBaseURL = () => {
  // Check if we're in production (not development)
  if (import.meta.env.PROD) {
    // For production, use the actual backend URL
    // Change this to your actual production backend URL
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }
  // In development, use the proxy
  return '/api';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout for slower connections
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Exponential backoff retry delay
const getRetryDelay = (retryCount) => {
  return RETRY_DELAY * Math.pow(2, retryCount);
};

// Helper to extract data from wrapped response
const extractData = (response) => {
  // Handle axios response structure - data is in response.data
  const data = response.data;
  
  // Only extract wrapped data for successful responses
  // This ensures error responses pass through unchanged
  if (data && data.success === true && data.data !== undefined) {
    return data.data;
  }
  
  // Return as-is for:
  // - Error responses (data.success === false or undefined)
  // - Arrays (backend no longer wraps them)
  // - Already unwrapped data
  return data;
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date().toISOString() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retries
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (process.env.NODE_ENV === 'development') {
      const startTime = response.config.metadata?.startTime;
      if (startTime) {
        const duration = new Date() - new Date(startTime);
        console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
      }
    }
    
    // Return the extracted data directly instead of the axios response
    return extractData(response);
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors with retry logic
    if (!error.response && !error.config.__retryCount) {
      error.config.__retryCount = 0;
    }
    
    // Retry logic for network errors
    if (
      !error.response && 
      error.config && 
      error.config.__retryCount < MAX_RETRIES
    ) {
      error.config.__retryCount += 1;
      const delay = getRetryDelay(error.config.__retryCount);
      
      console.log(`[API] Retrying request (${error.config.__retryCount}/${MAX_RETRIES}) after ${delay}ms...`);
      
      return new Promise((resolve) => 
        setTimeout(() => resolve(api(error.config)), delay)
      );
    }
    
    // Handle specific error codes
    if (error.response) {
      // Extract error message from wrapped response if available
      const errorData = error.response.data;
      const errorMessage = errorData?.message || errorData?.error || errorData?.errors?.[0]?.msg;
      
      // Create a custom error with proper message
      const customError = new Error(errorMessage || 'An error occurred');
      customError.response = error.response;
      customError.status = error.response.status;
      customError.data = errorData;
      
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Access forbidden:', errorMessage || 'You do not have permission');
          break;
        case 404:
          console.error('Resource not found:', errorMessage);
          break;
        case 409:
          console.error('Conflict:', errorMessage || 'Resource conflict');
          break;
        case 422:
          console.error('Validation error:', errorMessage || 'Invalid data');
          break;
        case 429:
          console.warn('Rate limited - please slow down');
          break;
        case 500:
          console.error('Server error - please try again later');
          break;
        case 503:
          console.error('Service unavailable - please try again later');
          break;
        default:
          console.error('Request error:', errorMessage || 'An error occurred');
      }
      
      return Promise.reject(customError);
    } else if (error.request) {
      // Network error (no response received)
      const networkError = new Error('Network error - please check your connection');
      networkError.request = error.request;
      return Promise.reject(networkError);
    } else {
      // Request was cancelled or timeout
      const requestError = new Error(error.message || 'Request cancelled or timeout');
      return Promise.reject(requestError);
    }
  }
);

// Helper functions for API calls
export const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

export default api;


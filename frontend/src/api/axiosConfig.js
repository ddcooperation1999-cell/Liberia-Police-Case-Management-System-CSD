import axios from 'axios';

// Set up axios instance with base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000, // 10 second timeout
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add token to headers if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 - Unauthorized
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
      
      // Handle 403 - Forbidden
      if (status === 403) {
        return Promise.reject(new Error(data.error || 'You do not have permission to access this resource.'));
      }
      
      // Handle 404 - Not Found
      if (status === 404) {
        return Promise.reject(new Error('Resource not found.'));
      }
      
      // Handle 422 - Unprocessable Entity
      if (status === 422) {
        return Promise.reject(new Error(data.error || 'Invalid request data.'));
      }
      
      // Handle 500 - Server Error
      if (status === 500) {
        return Promise.reject(new Error('Server error. Please try again later.'));
      }
      
      // Return the error data as is
      return Promise.reject(error);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('No response from server. Please check your connection.'));
    } else {
      // Error in request setup
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;

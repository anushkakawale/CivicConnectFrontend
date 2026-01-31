/**
 * Axios HTTP Client Configuration
 * Professional setup with environment variables, interceptors, and error handling
 */

import axios from "axios";
import { logApiCall } from "../utils/apiDebugger";
import { mockLogin, mockRegister, mockWards, mockDepartments } from "../utils/mockApi";

// Get configuration from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8083/api";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;
const ENABLE_LOGGING = import.meta.env.VITE_API_BASE_URL === "true" || import.meta.env.DEV;
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true"; // Enable mock only when explicitly set

/**
 * Create axios instance with base configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

/**
 * Public endpoints that don't require authentication
 */
const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/citizens/register",
  "/wards"
];

/**
 * Check if endpoint is public (doesn't require authentication)
 * @param {string} url - Request URL
 * @returns {boolean} True if endpoint is public
 */
const isPublicEndpoint = (url) => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

/**
 * Mock API handler for development
 */
const handleMockRequest = async (config) => {
  const { url, method, data } = config;

  if (USE_MOCK) {
    console.log("🔄 Using Mock API for:", method?.toUpperCase(), url);

    // Handle login
    if (url.includes('/auth/login') && method === 'post') {
      try {
        const response = await mockLogin(data.email, data.password);
        return response;
      } catch (error) {
        throw error;
      }
    }

    // Handle registration
    if (url.includes('/citizens/register') && method === 'post') {
      try {
        const response = await mockRegister(data);
        return response;
      } catch (error) {
        throw error;
      }
    }

    // Handle wards
    if (url.includes('/wards') && method === 'get') {
      return {
        data: mockWards,
        status: 200
      };
    }

    // Handle departments
    if (url.includes('/departments') && method === 'get') {
      return {
        data: mockDepartments,
        status: 200
      };
    }
  }

  return null; // Not a mock request
};

/**
 * Request Interceptor
 * Adds authentication token and logs requests in development
 */
api.interceptors.request.use(
  async (config) => {
    // Add request timestamp for performance monitoring
    config.metadata = { startTime: new Date() };

    // Check if this should use mock API
    const mockResponse = await handleMockRequest(config);
    if (mockResponse) {
      // Store mock response for the response interceptor
      config._mockResponse = mockResponse;
    }

    // Add authentication token for protected endpoints
    const token = localStorage.getItem("token");
    if (token && !isPublicEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (ENABLE_LOGGING) {
      const method = config.method?.toUpperCase();
      const url = config.url;
      const data = config.data;

      console.group(`🚀 API Request: ${method} ${url}`);
      console.log("📍 URL:", `${config.baseURL}${url}`);
      console.log("🔑 Headers:", config.headers);
      if (data) {
        console.log("📤 Request Data:", data);
      }
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    if (ENABLE_LOGGING) {
      console.error("❌ Request Setup Error:", error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles responses and errors globally
 */
api.interceptors.response.use(
  (response) => {
    // Check if this is a mock response
    if (response.config._mockResponse) {
      return response.config._mockResponse;
    }

    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;

    // Log successful response in development
    if (ENABLE_LOGGING) {
      const method = response.config.method?.toUpperCase();
      const url = response.config.url;
      const status = response.status;

      console.group(`✅ API Response: ${method} ${url}`);
      console.log("📊 Status:", status);
      console.log("⏱️ Duration:", `${duration}ms`);
      console.log("📥 Response Data:", response.data);
      console.groupEnd();
    }

    return response;
  },
  (error) => {
    // Check if this is a mock request that should be handled
    if (error.config && error.config._mockResponse) {
      return Promise.reject(error.config._mockResponse);
    }

    // Calculate request duration if available
    const duration = error.config?.metadata?.startTime
      ? new Date() - error.config.metadata.startTime
      : null;

    // Extract user-friendly error message
    const backendMessage = error.response?.data?.message;
    const errorMessage = backendMessage || error.message || "An unexpected error occurred";

    // Enhanced error logging
    if (ENABLE_LOGGING) {
      const method = error.config?.method?.toUpperCase() || "UNKNOWN";
      const url = error.config?.url || "UNKNOWN";

      console.group(`❌ API Error: ${method} ${url}`);
      console.error("📍 URL:", error.config?.baseURL + url);
      console.error("📊 Status:", error.response?.status || "No Response");
      console.error("� Message:", errorMessage); // Prioritize backend message

      if (duration) {
        console.error("⏱️ Duration:", `${duration}ms`);
      }

      if (error.response) {
        console.error("📥 Response Data:", error.response.data);
      }

      console.groupEnd();
    }

    // Handle 401 Unauthorized - clear session and redirect to login
    if (error.response?.status === 401) {
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        console.warn("🔒 Session expired. Redirecting to login...");
        localStorage.clear();
        window.location.href = "/";
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn("🚫 Access forbidden. You don't have permission for this action.");
      if (isPublicEndpoint(error.config?.url)) {
        console.error("⚠️ Public endpoint returned 403. Check Backend Security Configuration (CORS, CSRF, or permitAll).");
        errorMessage = "Backend Access Denied. Please contact the administrator.";
      }
    }

    // Construct a custom error object to pass to the UI
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);

/**
 * Export configured axios instance
 */
export default api;

/**
 * Export API configuration for reference
 */
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  loggingEnabled: ENABLE_LOGGING,
  useMock: USE_MOCK
};

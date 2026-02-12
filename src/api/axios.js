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
    "Accept": "application/json"
  }
});

/**
 * Public endpoints that don't require authentication
 */
const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/citizens/register",
  "/wards",
  "/departments",
  "/diagnostics",
  "/health"
];

/**
 * Check if endpoint is public (doesn't require authentication)
 * @param {string} url - Request URL
 * @returns {boolean} True if endpoint is public
 */
const isPublicEndpoint = (url) => {
  if (!url) return false;
  // Clean URL of query parameters for comparison
  const path = url.split('?')[0];
  return PUBLIC_ENDPOINTS.some(endpoint => path === endpoint || path.startsWith(endpoint + '/'));
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
    if (ENABLE_LOGGING && !config._silent) {
      const method = config.method?.toUpperCase();
      const url = config.url;
      const data = config.data;

      // Smart path logging: don't double up if URL is already absolute
      const fullUrl = url.startsWith('http') ? url : `${config.baseURL}${url}`;

      console.group(`🚀 API Request: ${method} ${url}`);
      console.log("📍 URL:", fullUrl);
      console.log("🔑 Auth Present:", !!config.headers.Authorization);
      if (data) {
        console.log("📤 Request Data Type:", data instanceof FormData ? 'FormData' : typeof data);
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
    if (ENABLE_LOGGING && !response.config._silent) {
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
    if (ENABLE_LOGGING && !error.config?._silent) {
      const method = error.config?.method?.toUpperCase() || "UNKNOWN";
      const url = error.config?.url || "UNKNOWN";
      const baseUrl = error.config?.baseURL || "";
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

      console.group(`❌ API Error: ${method} ${url}`);
      console.error("📍 URL:", fullUrl);
      console.error("📊 Status:", error.response?.status || "No Response");
      console.error(" Message:", errorMessage); // Prioritize backend message

      if (duration) {
        console.error("⏱️ Duration:", `${duration}ms`);
      }

      if (error.response) {
        console.error("📥 Response Data:", error.response.data);
        console.group("🧾 Response Headers");
        console.log(error.response.headers);
        console.groupEnd();
      }

      console.groupEnd();
    }

    // Handle 401 Unauthorized - clear session and redirect to login
    if (error.response?.status === 401) {
      const failedUrl = error.config?.url || "UNKNOWN";
      console.error("🔍 401 Unauthorized Error on URL:", failedUrl);

      const currentToken = localStorage.getItem("token");
      const currentRole = localStorage.getItem("role");
      const isPublic = isPublicEndpoint(failedUrl);

      console.warn("🛡️ Security Context Diagnostics:", {
        hasToken: !!currentToken,
        role: currentRole,
        isPublic: isPublic,
        pathname: window.location.pathname
      });

      // Temporary check: If this is an upload, don't immediately redirect to allow seeing the toast
      const isUpload = failedUrl.includes('/images');
      const isAuthCall = failedUrl.includes('/auth/');

      // If we have a token but got a 401 on a protected route, it's an invalid session
      if (!isPublic && currentToken && !isAuthCall && !isUpload) {
        if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
          console.warn("🔒 Invalid session detected for protected resource. Resetting security...");
          // Only clear if NOT on public pages to avoid loop
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          window.location.href = "/";
        }
      } else if (isAuthCall) {
        console.error("❌ Authentication failure during login/refresh. Check credentials.");
      } else if (isPublic) {
        console.warn("⚠️ Public endpoint returned 401. This is likely a Backend configuration error.");
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn("🚫 Access forbidden. You don't have permission for this action.");

      // Log specific path that failed
      const currentPath = window.location.pathname;
      console.warn(`403 Error on path: ${currentPath} for URL: ${error.config?.url}`);

      // Do NOT redirect automatically, as this causes loops if the dashboard calls a 403 endpoint.
      // Let the UI handle the error state.

      if (isPublicEndpoint(error.config?.url)) {
        console.error("⚠️ Public endpoint returned 403. Check Backend Security Configuration (CORS, CSRF, or permitAll).");
        // errorMessage is a const from line 189, so we should just use a different variable or modify the customError later
        const publicErrorMessage = "Backend Access Denied. Please contact the administrator.";
        const publicError = new Error(publicErrorMessage);
        publicError.status = 403;
        publicError.response = error.response;
        return Promise.reject(publicError);
      }
    }

    // Construct a custom error object to pass to the UI
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    customError.response = error.response; // Preserve response for compatibility
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

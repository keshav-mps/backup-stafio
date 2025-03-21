import axios from "axios";
import { getAuthToken } from "./tokenManager";
import config from "../config";

// Create axios instances with base URLs
const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const authClient = axios.create({
  baseURL: config.authBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally here (e.g., redirect to login on 401)
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access, redirecting to login");
      // You could redirect to login page here or handle token refresh
    }
    return Promise.reject(error);
  }
);

// Apply the same interceptors to authClient
authClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access, redirecting to login");
    }
    return Promise.reject(error);
  }
);

export { apiClient, authClient };

// Path :- jeevansetu-frontend/src/lib/api.js

import axios from "axios";

import { getAccessToken, clearAccessToken } from "./auth";



// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,

  withCredentials: true, // send cookies if backend uses them
});




// Attach Authorization header when token exists
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = config.headers || {};

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});




// Handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAccessToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
import axios from "axios";
import { env } from "@portl/env/native";
import { authClient } from "./auth-client";

const api = axios.create({
  baseURL: env.EXPO_PUBLIC_SERVER_URL,
  withCredentials: false, // managed manually below via interceptor
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach session cookie from SecureStore on every request.
// In React Native, cookies are NOT sent automatically like in browsers.
// The expoClient plugin stores the session in SecureStore and exposes getCookie().
api.interceptors.request.use(async (config) => {
  const cookie = authClient.getCookie();
  if (cookie) {
    config.headers["Cookie"] = cookie;
  }
  return config;
});

// Response interceptor — normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export { api };
export default api;

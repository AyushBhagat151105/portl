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

// Request interceptor — attach session cookie or Bearer token on every request.
// In React Native, manual Cookie headers can be stripped by OkHttp on Android.
// We extract the session token and set the Authorization Bearer header for 100% Android reliability.
api.interceptors.request.use(async (config) => {
  const cookie = authClient.getCookie();
  if (cookie) {
    config.headers["Cookie"] = cookie;

    const match = cookie.match(/better-auth\.session_token=([^;]+)/);
    if (match && match[1]) {
      config.headers["Authorization"] = `Bearer ${match[1]}`;
    }
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

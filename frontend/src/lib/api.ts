// Eden Treaty client - Type-safe API client
import { treaty } from "@elysiajs/eden";
import type { App } from "@backend/index";

// API base URL - sesuaikan dengan environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Get token from localStorage
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// Create Eden Treaty client
export const api = treaty<App>(API_URL, {
  fetch: {
    credentials: "include",
  },
});

// Helper to create authenticated request options
export const withAuth = () => ({
  headers: getAuthHeaders(),
});

// Export types for convenience
export type ApiClient = typeof api;

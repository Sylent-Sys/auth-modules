// Auth Modules SDK Client
import { createClient, type AuthModulesClient } from "auth-modules-sdk";

// API base URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create SDK client instance with browser storage
export const client = createClient({
  baseUrl: API_URL,
  storage: {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value),
    removeItem: (key: string) => localStorage.removeItem(key),
  },
});

// Export client type for convenience
export type { AuthModulesClient };

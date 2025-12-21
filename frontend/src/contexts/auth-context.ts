import { createContext } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  project_id: number;
  project_key: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type { User };

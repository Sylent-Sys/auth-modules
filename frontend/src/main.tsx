import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import {
  PublicLayout,
  ProtectedLayout,
  AdminLayout,
  SuperAdminLayout,
} from "@/components/layouts";
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProjectsPage,
  AssignmentsPage,
  UsersPage,
  RolesPage,
} from "@/pages";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedLayout />}>
            <Route index element={<DashboardPage />} />

            {/* Admin only routes */}
            <Route element={<AdminLayout />}>
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
            </Route>

            {/* Super Admin only routes */}
            <Route element={<SuperAdminLayout />}>
              <Route path="users" element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />
            </Route>
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);

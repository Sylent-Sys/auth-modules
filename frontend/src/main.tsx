/*
 * Sylent Auth Modules
 * Copyright (C) 2025 Renaldi Apriyanto Kadang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
  AuditLogsPage,
} from "@/pages";
import "./index.css";

// Subtle console signature to help identify running copies in the wild
if (typeof window !== "undefined") {
  try {
    const title = ["Running Sylent Auth Modules"].join(" - ");
    const style = "color: #646cff; font-weight: bold;";
    console.info("%c%s", style, title);
  } catch (e) {
    /* no-op: non-critical fingerprint */
  }
}

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
              <Route path="audit-logs" element={<AuditLogsPage />} />
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

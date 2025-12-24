import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";

// Layout untuk halaman publik (login, register)
export function PublicLayout() {
  const { isAuthenticated } = useAuth();

  // Redirect ke dashboard jika sudah login
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}

// Layout untuk halaman protected (dashboard, dll)
export function ProtectedLayout() {
  const { isAuthenticated, user, logout, isAdmin, isSuperAdmin } = useAuth();

  // Redirect ke login jika belum login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a href="/dashboard" className="btn btn-ghost text-xl">
            🔐 Auth Modules
          </a>
        </div>
        <div className="flex-none gap-2">
          {isAdmin && (
            <ul className="menu menu-horizontal px-1">
              <li>
                <a href="/dashboard/projects">Projects</a>
              </li>
              <li>
                <a href="/dashboard/assignments">Assignments</a>
              </li>
            </ul>
          )}
          {isSuperAdmin && (
            <ul className="menu menu-horizontal px-1">
              <li>
                <a href="/dashboard/users">Users</a>
              </li>
              <li>
                <a href="/dashboard/roles">Roles</a>
              </li>
              <li>
                <a href="/dashboard/audit-logs">Audit Logs</a>
              </li>
            </ul>
          )}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar placeholder"
            >
              <div className="bg-primary text-primary-content w-10 rounded-full">
                <span>{user?.name.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li className="menu-title">
                <span>{user?.name}</span>
                <span className="text-xs opacity-60">{user?.email}</span>
              </li>
              <li>
                <span className="badge badge-sm badge-primary">{user?.role}</span>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button onClick={logout} className="text-error">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-4">
        <Outlet />
      </div>
    </div>
  );
}

// Layout khusus admin
export function AdminLayout() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// Layout khusus super admin
export function SuperAdminLayout() {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

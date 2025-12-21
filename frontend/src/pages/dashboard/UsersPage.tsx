import { useState, useEffect, useCallback, type FormEvent } from "react";
import { api, withAuth } from "@/lib/api";

interface UserAssignment {
  project_id: number;
  project_name: string;
  project_key: string;
  role_id: number;
  role_name: string;
}

// User from list endpoint (no assignments)
interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

// User detail with assignments
interface UserDetail {
  id: number;
  name: string;
  email: string;
  assignments: UserAssignment[];
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit user modal
  const [editUser, setEditUser] = useState<UserDetail | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // View user detail modal
  const [viewUser, setViewUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await api.api.v1.users.get(withAuth());

      if (apiError) {
        const errData = apiError.value as { error?: string };
        setError(errData?.error || "Failed to fetch users");
        return;
      }

      if (data?.success) {
        setUsers(data.users);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewUser = async (userId: number) => {
    setLoadingDetail(true);
    try {
      const { data, error: apiError } = await api.api.v1.users({ id: userId }).get(withAuth());

      if (apiError) {
        const errData = apiError.value as { error?: string };
        setError(errData?.error || "Failed to fetch user details");
        return;
      }

      if (data?.success) {
        setViewUser(data.user);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEditClick = async (userId: number) => {
    setLoadingDetail(true);
    setUpdateError(null);
    try {
      const { data, error: apiError } = await api.api.v1.users({ id: userId }).get(withAuth());

      if (apiError) {
        const errData = apiError.value as { error?: string };
        setError(errData?.error || "Failed to fetch user details");
        return;
      }

      if (data?.success) {
        setEditUser(data.user);
        setEditForm({
          name: data.user.name,
          email: data.user.email,
          password: "",
        });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      const updateData: { name?: string; email?: string; password?: string } = {};

      if (editForm.name !== editUser.name) {
        updateData.name = editForm.name;
      }
      if (editForm.email !== editUser.email) {
        updateData.email = editForm.email;
      }
      if (editForm.password) {
        updateData.password = editForm.password;
      }

      // Don't update if nothing changed
      if (Object.keys(updateData).length === 0) {
        setEditUser(null);
        return;
      }

      const { data, error: apiError } = await api.api.v1.users({ id: editUser.id }).put(
        updateData,
        withAuth()
      );

      if (apiError) {
        const errData = apiError.value as { error?: string };
        setUpdateError(errData?.error || "Failed to update user");
        return;
      }

      if (data?.success) {
        setEditUser(null);
        fetchUsers();
      }
    } catch {
      setUpdateError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const { data, error: apiError } = await api.api.v1.users({ id: deleteTarget.id }).delete(
        {},
        withAuth()
      );

      if (apiError) {
        const errData = apiError.value as { error?: string };
        setError(errData?.error || "Failed to delete user");
        return;
      }

      if (data?.success) {
        setDeleteTarget(null);
        fetchUsers();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-base-content/60">Manage all registered users</p>
        </div>
        <button onClick={fetchUsers} className="btn btn-outline btn-sm" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-sm"></span> : "Refresh"}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button className="btn btn-sm" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td className="font-medium">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleViewUser(user.id)}
                            disabled={loadingDetail}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleEditClick(user.id)}
                            disabled={loadingDetail}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => setDeleteTarget(user)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View User Modal */}
      {viewUser && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">User Details</h3>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text text-xs opacity-60">ID</label>
                  <p className="font-mono">{viewUser.id}</p>
                </div>
                <div>
                  <label className="label-text text-xs opacity-60">Name</label>
                  <p className="font-medium">{viewUser.name}</p>
                </div>
                <div>
                  <label className="label-text text-xs opacity-60">Email</label>
                  <p>{viewUser.email}</p>
                </div>
                <div>
                  <label className="label-text text-xs opacity-60">Created At</label>
                  <p>{new Date(viewUser.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="divider">Project Assignments</div>

              {viewUser.assignments.length === 0 ? (
                <p className="text-base-content/60 text-center py-4">No project assignments</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Key</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewUser.assignments.map((a, idx) => (
                        <tr key={idx}>
                          <td>{a.project_name}</td>
                          <td><code className="text-xs">{a.project_key}</code></td>
                          <td>
                            <span className={`badge badge-sm ${
                              a.role_name === "super_admin" ? "badge-error" :
                              a.role_name === "admin" ? "badge-warning" : "badge-info"
                            }`}>
                              {a.role_name}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setViewUser(null)}>Close</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setViewUser(null)}>close</button>
          </form>
        </dialog>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit User</h3>
            <form onSubmit={handleUpdate} className="py-4 space-y-4">
              {updateError && (
                <div className="alert alert-error alert-sm">
                  <span>{updateError}</span>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                  <span className="label-text-alt">Leave empty to keep current</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setEditUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? <span className="loading loading-spinner loading-sm"></span> : "Save"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setEditUser(null)}>close</button>
          </form>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete User</h3>
            <p className="py-4">
              Are you sure you want to delete user <strong>{deleteTarget.name}</strong>?
              <br />
              <span className="text-sm text-base-content/60">
                This will also remove all their project assignments.
              </span>
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-error" onClick={handleDelete} disabled={deleting}>
                {deleting ? <span className="loading loading-spinner loading-sm"></span> : "Delete"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setDeleteTarget(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

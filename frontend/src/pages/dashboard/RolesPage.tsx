import { useState, useEffect, useCallback, type FormEvent } from "react";
import { client } from "@/lib/api";
import { SDKError, type Role } from "auth-modules-sdk";

// Protected system roles that cannot be modified or deleted
const PROTECTED_ROLES = ["super_admin", "admin", "member"];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create role modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit role modal
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await client.roles.list();

      if (data.success) {
        setRoles(data.roles);
      }
    } catch (err) {
      if (err instanceof SDKError) {
        setError(err.message);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const data = await client.roles.create({
        name: createForm.name,
        description: createForm.description || undefined,
      });

      if (data.success) {
        setShowCreateModal(false);
        setCreateForm({ name: "", description: "" });
        fetchRoles();
      }
    } catch (err) {
      if (err instanceof SDKError) {
        setCreateError(err.message);
      } else {
        setCreateError("Network error. Please try again.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (role: Role) => {
    setEditRole(role);
    setEditForm({
      name: role.name,
      description: role.description || "",
    });
    setUpdateError(null);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editRole) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      const updateData: { name?: string; description?: string } = {};

      if (editForm.name !== editRole.name) {
        updateData.name = editForm.name;
      }
      if (editForm.description !== (editRole.description || "")) {
        updateData.description = editForm.description;
      }

      // Don't update if nothing changed
      if (Object.keys(updateData).length === 0) {
        setEditRole(null);
        return;
      }

      const data = await client.roles.update(editRole.id, updateData);

      if (data.success) {
        setEditRole(null);
        fetchRoles();
      }
    } catch (err) {
      if (err instanceof SDKError) {
        setUpdateError(err.message);
      } else {
        setUpdateError("Network error. Please try again.");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const data = await client.roles.delete(deleteTarget.id);

      if (data.success) {
        setDeleteTarget(null);
        fetchRoles();
      }
    } catch (err) {
      if (err instanceof SDKError) {
        setError(err.message);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const isProtectedRole = (roleName: string) => PROTECTED_ROLES.includes(roleName);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Roles Management</h1>
          <p className="text-base-content/60">Manage user roles and permissions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchRoles} className="btn btn-outline btn-sm" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm"></span> : "Refresh"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            + New Role
          </button>
        </div>
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

      {/* Info Alert */}
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>System roles (super_admin, admin, member) cannot be modified or deleted.</span>
      </div>

      {/* Roles Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No roles found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>{role.id}</td>
                      <td>
                        <span className={`font-medium ${
                          role.name === "super_admin" ? "text-error" :
                          role.name === "admin" ? "text-warning" :
                          role.name === "member" ? "text-info" : ""
                        }`}>
                          {role.name}
                        </span>
                      </td>
                      <td>{role.description || <span className="opacity-40">—</span>}</td>
                      <td>
                        {isProtectedRole(role.name) ? (
                          <span className="badge badge-sm badge-outline badge-warning">System</span>
                        ) : (
                          <span className="badge badge-sm badge-outline">Custom</span>
                        )}
                      </td>
                      <td>
                        {isProtectedRole(role.name) ? (
                          <span className="text-xs text-base-content/40">Protected</span>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleEditClick(role)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => setDeleteTarget(role)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create New Role</h3>
            <form onSubmit={handleCreate} className="py-4 space-y-4">
              {createError && (
                <div className="alert alert-error alert-sm">
                  <span>{createError}</span>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g., reviewer, developer, viewer"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                  <span className="label-text-alt">Optional</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Description of this role..."
                  rows={3}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ name: "", description: "" });
                    setCreateError(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <span className="loading loading-spinner loading-sm"></span> : "Create"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowCreateModal(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Edit Role Modal */}
      {editRole && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit Role</h3>
            <form onSubmit={handleUpdate} className="py-4 space-y-4">
              {updateError && (
                <div className="alert alert-error alert-sm">
                  <span>{updateError}</span>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role Name</span>
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
                  <span className="label-text">Description</span>
                  <span className="label-text-alt">Optional</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setEditRole(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? <span className="loading loading-spinner loading-sm"></span> : "Save"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setEditRole(null)}>close</button>
          </form>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Role</h3>
            <p className="py-4">
              Are you sure you want to delete the role <strong>{deleteTarget.name}</strong>?
              <br />
              <span className="text-sm text-base-content/60">
                This role must not be assigned to any users.
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

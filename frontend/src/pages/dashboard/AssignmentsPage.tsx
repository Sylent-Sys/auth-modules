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

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { client } from "@/lib/api";
import { SDKError, type Assignment, type Role, type Project } from "auth-modules-sdk";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [filterProjectId, setFilterProjectId] = useState<string>("");

  // Create assignment form
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    project_id: "",
    role_id: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit assignment (change role)
  const [editTarget, setEditTarget] = useState<Assignment | null>(null);
  const [editRoleId, setEditRoleId] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{
    user_id: number;
    project_id: number;
    user_name: string;
    project_name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = filterProjectId
        ? { project_id: Number(filterProjectId) }
        : undefined;

      const data = await client.assignments.list(query);

      if (data.success) {
        setAssignments(data.assignments);
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
  }, [filterProjectId]);

  const fetchRoles = async () => {
    try {
      const data = await client.assignments.listRoles();
      if (data.success) {
        setRoles(data.roles);
      }
    } catch {
      // Ignore role fetch errors
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await client.projects.list();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch {
      // Ignore project fetch errors
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchRoles();
    fetchProjects();
  }, [fetchAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [filterProjectId, fetchAssignments]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);

    try {
      const data = await client.assignments.create({
        user_id: Number(formData.user_id),
        project_id: Number(formData.project_id),
        role_id: Number(formData.role_id),
      });

      if (data.success) {
        setShowModal(false);
        setFormData({ user_id: "", project_id: "", role_id: "" });
        fetchAssignments();
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

  const handleEditClick = (assignment: Assignment) => {
    setEditTarget(assignment);
    setEditRoleId(String(assignment.role_id));
    setUpdateError(null);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    // Don't update if role hasn't changed
    if (Number(editRoleId) === editTarget.role_id) {
      setEditTarget(null);
      return;
    }

    setUpdating(true);
    setUpdateError(null);

    try {
      // Use create to update (upsert behavior in backend)
      const data = await client.assignments.create({
        user_id: editTarget.user_id,
        project_id: editTarget.project_id,
        role_id: Number(editRoleId),
      });

      if (data.success) {
        setEditTarget(null);
        fetchAssignments();
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
      await client.assignments.delete({
        user_id: deleteTarget.user_id,
        project_id: deleteTarget.project_id,
      });

      setDeleteTarget(null);
      fetchAssignments();
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

  const getRoleBadgeClass = (roleName: string) => {
    switch (roleName) {
      case "super_admin":
        return "badge-error";
      case "admin":
        return "badge-warning";
      case "member":
        return "badge-info";
      default:
        return "badge-ghost";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-base-content/60">
            Manage user-project assignments
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Assignment
        </button>
      </div>

      {/* Filter */}
      <div className="card bg-base-100 shadow">
        <div className="card-body py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold">Filter by Project:</span>
            <select
              title="Filter by Project"
              className="select select-bordered select-sm"
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {filterProjectId && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setFilterProjectId("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
          <button className="btn btn-sm" onClick={fetchAssignments}>
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Assignments Table */}
      {!loading && !error && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Project</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-base-content/60"
                      >
                        No assignments found.
                      </td>
                    </tr>
                  ) : (
                    assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>
                          <div>
                            <div className="font-semibold">
                              {assignment.user_name}
                            </div>
                            <div className="text-sm text-base-content/60">
                              {assignment.user_email}
                            </div>
                            <div className="text-xs text-base-content/40">
                              ID: {assignment.user_id}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold">
                            {assignment.project_name}
                          </div>
                          <div className="text-xs text-base-content/40">
                            ID: {assignment.project_id}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${getRoleBadgeClass(
                              assignment.role_name
                            )} capitalize`}
                          >
                            {assignment.role_name}
                          </span>
                        </td>
                        <td className="text-sm">
                          {new Date(assignment.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              title="Edit Role"
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleEditClick(assignment)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              title="Delete"
                              className="btn btn-ghost btn-sm text-error"
                              onClick={() =>
                                setDeleteTarget({
                                  user_id: assignment.user_id,
                                  project_id: assignment.project_id,
                                  user_name: assignment.user_name,
                                  project_name: assignment.project_name,
                                })
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      <dialog className={`modal ${showModal ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create New Assignment</h3>

          {createError && (
            <div className="alert alert-error mt-4">
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">User ID *</span>
              </label>
              <input
                type="number"
                placeholder="Enter user ID"
                className="input input-bordered w-full"
                value={formData.user_id}
                onChange={(e) =>
                  setFormData({ ...formData, user_id: e.target.value })
                }
                required
                min="1"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Project *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.project_id}
                onChange={(e) =>
                  setFormData({ ...formData, project_id: e.target.value })
                }
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.project_key})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Role *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.role_id}
                onChange={(e) =>
                  setFormData({ ...formData, role_id: e.target.value })
                }
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setShowModal(false);
                  setCreateError(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating && <span className="loading loading-spinner"></span>}
                Create Assignment
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowModal(false)}>close</button>
        </form>
      </dialog>

      {/* Delete Confirmation Modal */}
      <dialog className={`modal ${deleteTarget ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Delete Assignment</h3>
          <p className="py-4">
            Are you sure you want to remove{" "}
            <span className="font-semibold">{deleteTarget?.user_name}</span>{" "}
            from{" "}
            <span className="font-semibold">{deleteTarget?.project_name}</span>?
          </p>
          <p className="text-sm text-base-content/60">
            This action cannot be undone.
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <span className="loading loading-spinner"></span>}
              Delete
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setDeleteTarget(null)}>close</button>
        </form>
      </dialog>

      {/* Edit Assignment Modal (Change Role) */}
      {editTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Change Role</h3>
            <form onSubmit={handleUpdate} className="py-4 space-y-4">
              {updateError && (
                <div className="alert alert-error alert-sm">
                  <span>{updateError}</span>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">User</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={`${editTarget.user_name} (${editTarget.user_email})`}
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Project</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editTarget.project_name}
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  title="Select role"
                  className="select select-bordered"
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(e.target.value)}
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setEditTarget(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? <span className="loading loading-spinner loading-sm"></span> : "Save"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setEditTarget(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}

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

import { useState, useEffect, type FormEvent } from "react";
import { client } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { SDKError, type Project } from "auth-modules-sdk";

export default function ProjectsPage() {
  const { isSuperAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create project form
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", base_url: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit project form
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ name: "", base_url: "" });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await client.projects.list();

      if (data.success) {
        setProjects(data.projects);
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
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);

    try {
      const data = await client.projects.create({
        name: formData.name,
        base_url: formData.base_url || undefined,
      });

      if (data.success) {
        setShowModal(false);
        setFormData({ name: "", base_url: "" });
        fetchProjects();
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

  const handleEditClick = (project: Project) => {
    setEditProject(project);
    setEditForm({
      name: project.name,
      base_url: project.base_url || "",
    });
    setUpdateError(null);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editProject) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      const updateData: { name?: string; base_url?: string | null } = {};

      if (editForm.name !== editProject.name) {
        updateData.name = editForm.name;
      }
      if (editForm.base_url !== (editProject.base_url || "")) {
        updateData.base_url = editForm.base_url || null;
      }

      // Don't update if nothing changed
      if (Object.keys(updateData).length === 0) {
        setEditProject(null);
        return;
      }

      const data = await client.projects.update(editProject.id, updateData);

      if (data.success) {
        setEditProject(null);
        fetchProjects();
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
      const data = await client.projects.delete(deleteTarget.id);

      if (data.success) {
        setDeleteTarget(null);
        fetchProjects();
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-base-content/60">Manage all registered projects</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Project
        </button>
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
          <button className="btn btn-sm" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* RBAC Info */}
      {!isSuperAdmin && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>You have Admin access. Edit and Delete actions require Super Admin privileges.</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Projects Table */}
      {!loading && !error && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Project Key</th>
                    <th>Base URL</th>
                    <th>Created At</th>
                    {isSuperAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 6 : 5} className="text-center py-8 text-base-content/60">
                        No projects found. Create your first project!
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr key={project.id}>
                        <td>{project.id}</td>
                        <td className="font-semibold">{project.name}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <code className="bg-base-200 px-2 py-1 rounded text-sm">
                              {project.project_key}
                            </code>
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => copyToClipboard(project.project_key)}
                              title="Copy to clipboard"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td>
                          {project.base_url ? (
                            <a
                              href={project.base_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary"
                            >
                              {project.base_url}
                            </a>
                          ) : (
                            <span className="text-base-content/40">-</span>
                          )}
                        </td>
                        <td className="text-sm">
                          {project.created_at
                            ? new Date(project.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                        {isSuperAdmin && (
                          <td>
                            <div className="flex gap-1">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => handleEditClick(project)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => setDeleteTarget(project)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <dialog className={`modal ${showModal ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create New Project</h3>

          {createError && (
            <div className="alert alert-error mt-4">
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Project Name *</span>
              </label>
              <input
                type="text"
                placeholder="My Awesome Project"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Base URL (Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://myapp.example.com"
                className="input input-bordered w-full"
                value={formData.base_url}
                onChange={(e) =>
                  setFormData({ ...formData, base_url: e.target.value })
                }
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Used for CORS configuration
                </span>
              </label>
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
                Create Project
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowModal(false)}>close</button>
        </form>
      </dialog>

      {/* Edit Project Modal */}
      {editProject && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Edit Project</h3>

            {updateError && (
              <div className="alert alert-error mt-4">
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Project Key</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editProject.project_key}
                  disabled
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Project key cannot be changed
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Project Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="My Awesome Project"
                  className="input input-bordered w-full"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Base URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://myapp.example.com"
                  className="input input-bordered w-full"
                  value={editForm.base_url}
                  onChange={(e) =>
                    setEditForm({ ...editForm, base_url: e.target.value })
                  }
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Used for CORS configuration. Leave empty to remove.
                  </span>
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setEditProject(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating && <span className="loading loading-spinner"></span>}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setEditProject(null)}>close</button>
          </form>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Project</h3>
            <p className="py-4">
              Are you sure you want to delete project{" "}
              <span className="font-semibold">{deleteTarget.name}</span>?
            </p>
            <p className="text-sm text-base-content/60">
              Project key: <code>{deleteTarget.project_key}</code>
            </p>
            <p className="text-sm text-warning mt-2">
              This action cannot be undone. Make sure there are no active assignments.
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
      )}
    </div>
  );
}

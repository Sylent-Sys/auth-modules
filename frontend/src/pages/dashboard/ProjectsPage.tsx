import { useState, useEffect, type FormEvent } from "react";
import { api, withAuth } from "@/lib/api";

interface Project {
  id: number;
  name: string;
  project_key: string;
  base_url: string | null;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create project form
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", base_url: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await api.api.v1.projects.get(withAuth());

      if (apiError) {
        const errData = apiError.value as { error?: string };
        setError(errData?.error || "Failed to fetch projects");
        return;
      }

      if (data?.success) {
        setProjects(data.projects);
      }
    } catch {
      setError("Network error. Please try again.");
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
      const { data, error: apiError } = await api.api.v1.projects.post(
        {
          name: formData.name,
          base_url: formData.base_url || undefined,
        },
        withAuth()
      );

      if (apiError) {
        const errData = apiError.value as { error?: string };
        setCreateError(errData?.error || "Failed to create project");
        return;
      }

      if (data?.success) {
        setShowModal(false);
        setFormData({ name: "", base_url: "" });
        fetchProjects();
      }
    } catch {
      setCreateError("Network error. Please try again.");
    } finally {
      setCreating(false);
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
          <button className="btn btn-sm" onClick={fetchProjects}>
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
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-base-content/60">
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
                          {new Date(project.created_at).toLocaleDateString()}
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
    </div>
  );
}

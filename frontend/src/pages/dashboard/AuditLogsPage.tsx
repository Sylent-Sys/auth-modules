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

import { useState, useEffect, useCallback } from "react";
import { client } from "@/lib/api";
import { SDKError, type AuditLog } from "auth-modules-sdk";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [entityType, setEntityType] = useState<"" | "user" | "role">("");
  const [action, setAction] = useState<"" | "create" | "update" | "delete">("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams: {
        entity_type?: "user" | "role";
        action?: "create" | "update" | "delete";
        limit?: number;
        offset?: number;
      } = {
        limit,
        offset: (page - 1) * limit,
      };

      if (entityType) queryParams.entity_type = entityType;
      if (action) queryParams.action = action;

      const data = await client.auditLogs.list(queryParams);

      if (data.success) {
        setLogs(data.logs);
        setTotal(data.total);
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
  }, [entityType, action, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatChanges = (changes: Record<string, unknown> | null) => {
    if (!changes) return "-";
    return Object.entries(changes)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(", ");
  };

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case "create":
        return <span className="badge badge-success badge-sm">Create</span>;
      case "update":
        return <span className="badge badge-warning badge-sm">Update</span>;
      case "delete":
        return <span className="badge badge-error badge-sm">Delete</span>;
      default:
        return <span className="badge badge-sm">{actionType}</span>;
    }
  };

  const getEntityBadge = (entity: string) => {
    switch (entity) {
      case "user":
        return <span className="badge badge-info badge-sm">User</span>;
      case "role":
        return <span className="badge badge-secondary badge-sm">Role</span>;
      default:
        return <span className="badge badge-sm">{entity}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-base-content/60">Track changes to users and roles</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-outline btn-sm" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-sm"></span> : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body py-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Entity Type</span>
              </label>
              <select
                title="Filter by entity type"
                className="select select-bordered select-sm"
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value as "" | "user" | "role");
                  handleFilterChange();
                }}
              >
                <option value="">All</option>
                <option value="user">User</option>
                <option value="role">Role</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Action</span>
              </label>
              <select
                title="Filter by action"
                className="select select-bordered select-sm"
                value={action}
                onChange={(e) => {
                  setAction(e.target.value as "" | "create" | "update" | "delete");
                  handleFilterChange();
                }}
              >
                <option value="">All</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>

            <div className="text-sm text-base-content/60">
              Total: {total} logs
            </div>
          </div>
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

      {/* Logs Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No audit logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Entity</th>
                    <th>Action</th>
                    <th>Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td className="whitespace-nowrap">{formatDate(log.created_at)}</td>
                      <td>
                        <div className="font-medium">{log.actor_name}</div>
                        <div className="text-xs text-base-content/60">ID: {log.actor_id}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {getEntityBadge(log.entity_type)}
                          <span className="text-sm">#{log.entity_id}</span>
                        </div>
                      </td>
                      <td>{getActionBadge(log.action)}</td>
                      <td className="max-w-xs truncate" title={formatChanges(log.changes)}>
                        {formatChanges(log.changes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  «
                </button>
                <button className="join-item btn btn-sm">
                  Page {page} of {totalPages}
                </button>
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

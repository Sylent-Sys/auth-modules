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

import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  service: string;
  version: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Direct fetch for health endpoint (not part of SDK)
        const response = await fetch(
          (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/"
        );
        const data = await response.json();
        setHealth(data);
      } catch {
        setError("Failed to connect to API");
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Auth Modules</h2>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {health && (
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span className="badge badge-success">{health.status}</span>
              </p>
              <p>
                <span className="font-semibold">Service:</span> {health.service}
              </p>
              <p>
                <span className="font-semibold">Version:</span> {health.version}
              </p>
            </div>
          )}

          {!health && !error && (
            <span className="loading loading-spinner loading-md"></span>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

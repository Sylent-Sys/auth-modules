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

/**
 * Audit Logs Resource - Audit log read-only access
 */

import type { HttpClient } from '../http-client';
import type { ListAuditLogsParams, ListAuditLogsResponse } from '../types';

/**
 * API path prefix for audit-logs endpoints
 */
const BASE_PATH = '/api/v1/audit-logs';

/**
 * Audit Logs resource class for viewing audit logs
 * Requires Super Admin access for all operations
 * Read-only access (no create/update/delete)
 */
export class AuditLogsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List audit logs with optional filters
   * Requires Super Admin access
   *
   * @param params - Optional filter and pagination parameters
   * @returns List of audit logs with total count
   * @throws {SDKError} On auth/permission error
   *
   * @example
   * ```ts
   * // List all logs
   * const { logs, total } = await client.auditLogs.list();
   *
   * // Filter by entity type
   * const { logs } = await client.auditLogs.list({
   *   entity_type: 'user',
   *   action: 'create',
   *   limit: 10,
   *   offset: 0
   * });
   *
   * // Filter by actor
   * const { logs } = await client.auditLogs.list({
   *   actor_id: 1
   * });
   * ```
   */
  async list(params?: ListAuditLogsParams): Promise<ListAuditLogsResponse> {
    return this.http.get<ListAuditLogsResponse>(BASE_PATH, {
      params: params as Record<string, string | number | undefined>,
    });
  }
}

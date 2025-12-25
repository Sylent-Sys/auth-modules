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

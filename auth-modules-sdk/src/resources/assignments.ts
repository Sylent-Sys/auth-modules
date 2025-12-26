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
 * Assignments Resource - Project assignment management API calls
 */

import type { HttpClient } from '../http-client';
import type {
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  DeleteAssignmentParams,
  DeleteAssignmentResponse,
  ListAssignmentRolesResponse,
  ListAssignmentsParams,
  ListAssignmentsResponse,
} from '../types';

/**
 * API path prefix for assignments endpoints
 */
const BASE_PATH = '/api/v1/assignments';

/**
 * Assignments resource class for project assignment operations
 * Requires Admin access for all operations
 */
export class AssignmentsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all assignments
   * Optionally filter by project_id
   * Requires Admin access
   *
   * @param params - Optional filter parameters
   * @returns List of assignments
   * @throws {SDKError} On auth/permission error
   *
   * @example
   * ```ts
   * // List all assignments
   * const { assignments } = await client.assignments.list();
   *
   * // List assignments for a specific project
   * const { assignments } = await client.assignments.list({ project_id: 1 });
   * ```
   */
  async list(params?: ListAssignmentsParams): Promise<ListAssignmentsResponse> {
    return this.http.get<ListAssignmentsResponse>(BASE_PATH, {
      params: params ? { project_id: params.project_id } : undefined,
    });
  }

  /**
   * Assign user to a project with a role
   * If assignment already exists, updates the role
   * Requires Admin access
   *
   * @param data - Assignment data
   * @returns Created/updated assignment info
   * @throws {SDKError} On not found (user/project/role) or permission error
   *
   * @example
   * ```ts
   * const { assignment } = await client.assignments.create({
   *   user_id: 1,
   *   project_id: 2,
   *   role_id: 3
   * });
   * console.log(`${assignment.user_name} assigned to ${assignment.project_name}`);
   * ```
   */
  async create(data: CreateAssignmentRequest): Promise<CreateAssignmentResponse> {
    return this.http.post<CreateAssignmentResponse>(BASE_PATH, data);
  }

  /**
   * Remove user's assignment from a project
   * Requires Admin access
   *
   * @param params - User ID and Project ID
   * @returns Deletion confirmation
   * @throws {SDKError} On not found or permission error
   *
   * @example
   * ```ts
   * await client.assignments.delete({
   *   user_id: 1,
   *   project_id: 2
   * });
   * ```
   */
  async delete(params: DeleteAssignmentParams): Promise<DeleteAssignmentResponse> {
    return this.http.delete<DeleteAssignmentResponse>(BASE_PATH, {
      params: {
        user_id: params.user_id,
        project_id: params.project_id,
      },
    });
  }

  /**
   * List all available roles for assignments
   * Requires Admin access
   *
   * @returns List of available roles
   * @throws {SDKError} On auth/permission error
   *
   * @example
   * ```ts
   * const { roles } = await client.assignments.listRoles();
   * roles.forEach(role => console.log(role.name));
   * ```
   */
  async listRoles(): Promise<ListAssignmentRolesResponse> {
    return this.http.get<ListAssignmentRolesResponse>(`${BASE_PATH}/roles`);
  }
}

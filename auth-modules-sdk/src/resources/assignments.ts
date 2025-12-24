/**
 * Assignments Resource - Project assignment management API calls
 */

import { HttpClient } from '../http-client';
import type {
  CreateAssignmentRequest,
  ListAssignmentsParams,
  DeleteAssignmentParams,
  CreateAssignmentResponse,
  ListAssignmentsResponse,
  DeleteAssignmentResponse,
  ListAssignmentRolesResponse,
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

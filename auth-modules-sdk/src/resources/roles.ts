/**
 * Roles Resource - Role management API calls
 */

import type { HttpClient } from '../http-client';
import type {
  CreateRoleRequest,
  CreateRoleResponse,
  DeleteRoleResponse,
  ListRolesResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
} from '../types';

/**
 * API path prefix for roles endpoints
 */
const BASE_PATH = '/api/v1/roles';

/**
 * Roles resource class for role management operations
 * Requires Super Admin access for all operations
 */
export class RolesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all roles
   * Requires Super Admin access
   *
   * @returns List of all roles
   * @throws {SDKError} On auth/permission error
   *
   * @example
   * ```ts
   * const { roles } = await client.roles.list();
   * roles.forEach(role => console.log(role.name));
   * ```
   */
  async list(): Promise<ListRolesResponse> {
    return this.http.get<ListRolesResponse>(BASE_PATH);
  }

  /**
   * Create a new role
   * Requires Super Admin access
   *
   * @param data - Role creation data
   * @returns Created role info
   * @throws {SDKError} On validation error or if name exists
   *
   * @example
   * ```ts
   * const { role } = await client.roles.create({
   *   name: 'editor',
   *   description: 'Can edit content'
   * });
   * console.log(`Created role #${role.id}`);
   * ```
   */
  async create(data: CreateRoleRequest): Promise<CreateRoleResponse> {
    return this.http.post<CreateRoleResponse>(BASE_PATH, data);
  }

  /**
   * Update a role
   * Requires Super Admin access
   * Protected system roles cannot be modified
   *
   * @param id - Role ID
   * @param data - Fields to update
   * @returns Updated role info
   * @throws {SDKError} On not found, permission error, or protected role
   *
   * @example
   * ```ts
   * const { role } = await client.roles.update(4, {
   *   description: 'Updated description'
   * });
   * ```
   */
  async update(id: number, data: UpdateRoleRequest): Promise<UpdateRoleResponse> {
    return this.http.put<UpdateRoleResponse>(`${BASE_PATH}/${id}`, data);
  }

  /**
   * Delete a role
   * Requires Super Admin access
   * Protected system roles cannot be deleted
   *
   * @param id - Role ID
   * @returns Deletion confirmation
   * @throws {SDKError} On not found, permission error, or protected role
   *
   * @example
   * ```ts
   * await client.roles.delete(4);
   * ```
   */
  async delete(id: number): Promise<DeleteRoleResponse> {
    return this.http.delete<DeleteRoleResponse>(`${BASE_PATH}/${id}`);
  }
}

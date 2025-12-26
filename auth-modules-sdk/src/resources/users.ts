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
 * Users Resource - User management API calls
 */

import type { HttpClient } from '../http-client';
import type {
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserResponse,
  ListUsersResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UserDetailResponse,
} from '../types';

/**
 * API path prefix for users endpoints
 */
const BASE_PATH = '/api/v1/users';

/**
 * Users resource class for user management operations
 * Requires Super Admin access for most operations
 */
export class UsersResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all users
   * Requires Super Admin access
   *
   * @returns List of all users
   * @throws {SDKError} On auth/permission error
   *
   * @example
   * ```ts
   * const { users } = await client.users.list();
   * users.forEach(user => console.log(user.name));
   * ```
   */
  async list(): Promise<ListUsersResponse> {
    return this.http.get<ListUsersResponse>(BASE_PATH);
  }

  /**
   * Get user by ID with assignments
   * Requires Super Admin access
   *
   * @param id - User ID
   * @returns User detail with assignments
   * @throws {SDKError} On not found or permission error
   *
   * @example
   * ```ts
   * const { user } = await client.users.getById(1);
   * console.log(user.assignments);
   * ```
   */
  async getById(id: number): Promise<UserDetailResponse> {
    return this.http.get<UserDetailResponse>(`${BASE_PATH}/${id}`);
  }

  /**
   * Create a new user
   * Requires Super Admin access
   *
   * @param data - User creation data
   * @returns Created user info
   * @throws {SDKError} On validation error or if email exists
   *
   * @example
   * ```ts
   * const { user } = await client.users.create({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   password: 'securepass123'
   * });
   * console.log(`Created user #${user.id}`);
   * ```
   */
  async create(data: CreateUserRequest): Promise<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(BASE_PATH, data);
  }

  /**
   * Update a user
   * Requires Super Admin access
   *
   * @param id - User ID
   * @param data - Fields to update
   * @returns Updated user info
   * @throws {SDKError} On not found or permission error
   *
   * @example
   * ```ts
   * const { user } = await client.users.update(1, {
   *   name: 'Jane Doe'
   * });
   * ```
   */
  async update(id: number, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(`${BASE_PATH}/${id}`, data);
  }

  /**
   * Delete a user
   * Requires Super Admin access
   *
   * @param id - User ID
   * @returns Deletion confirmation
   * @throws {SDKError} On not found or if user has assignments
   *
   * @example
   * ```ts
   * await client.users.delete(1);
   * ```
   */
  async delete(id: number): Promise<DeleteUserResponse> {
    return this.http.delete<DeleteUserResponse>(`${BASE_PATH}/${id}`);
  }
}

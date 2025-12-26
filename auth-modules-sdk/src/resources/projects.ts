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
 * Projects Resource - Project management API calls
 */

import type { HttpClient } from '../http-client';
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  DeleteProjectResponse,
  ListProjectsResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
} from '../types';

/**
 * API path prefix for projects endpoints
 */
const BASE_PATH = '/api/v1/projects';

/**
 * Projects resource class for project management operations
 * Requires Admin access for most operations
 */
export class ProjectsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all projects
   * Requires Admin access
   *
   * @returns List of all projects
   * @throws {SDKError} On auth/permission error
   *
   * @example
   * ```ts
   * const { projects } = await client.projects.list();
   * projects.forEach(p => console.log(`${p.name}: ${p.project_key}`));
   * ```
   */
  async list(): Promise<ListProjectsResponse> {
    return this.http.get<ListProjectsResponse>(BASE_PATH);
  }

  /**
   * Create a new project
   * Requires Admin access
   * Auto-generates a unique project_key
   *
   * @param data - Project creation data
   * @returns Created project with generated project_key
   * @throws {SDKError} On validation error
   *
   * @example
   * ```ts
   * const { project } = await client.projects.create({
   *   name: 'My New Project',
   *   base_url: 'https://myapp.com'
   * });
   * console.log(`Project key: ${project.project_key}`);
   * ```
   */
  async create(data: CreateProjectRequest): Promise<CreateProjectResponse> {
    return this.http.post<CreateProjectResponse>(BASE_PATH, data);
  }

  /**
   * Update a project
   * Requires Super Admin access
   *
   * @param id - Project ID
   * @param data - Fields to update
   * @returns Updated project info
   * @throws {SDKError} On not found or permission error
   *
   * @example
   * ```ts
   * const { project } = await client.projects.update(1, {
   *   name: 'Updated Project Name',
   *   base_url: 'https://updated-url.com'
   * });
   * ```
   */
  async update(id: number, data: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    return this.http.put<UpdateProjectResponse>(`${BASE_PATH}/${id}`, data);
  }

  /**
   * Delete a project
   * Requires Super Admin access
   * Cannot delete if project has active assignments
   *
   * @param id - Project ID
   * @returns Deletion confirmation
   * @throws {SDKError} On not found or if project has assignments
   *
   * @example
   * ```ts
   * await client.projects.delete(1);
   * ```
   */
  async delete(id: number): Promise<DeleteProjectResponse> {
    return this.http.delete<DeleteProjectResponse>(`${BASE_PATH}/${id}`);
  }
}

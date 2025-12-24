/**
 * Auth Modules SDK - Main Client
 * 
 * Isomorphic TypeScript SDK for Auth Modules REST API
 * Works in both Browser (React, Vue, etc.) and Server (Node.js, Bun, Deno)
 * 
 * @packageDocumentation
 */

import { HttpClient, MemoryStorage, LocalStorageAdapter } from './http-client';
import {
  AuthResource,
  UsersResource,
  ProjectsResource,
  RolesResource,
  AssignmentsResource,
  AuditLogsResource,
} from './resources';
import type { SDKConfig } from './types';
import { SDKError } from './types';

/**
 * Main Auth Modules SDK Client
 * 
 * @example
 * ```ts
 * // Browser usage
 * const client = new AuthModulesClient({
 *   baseUrl: 'http://localhost:3000'
 * });
 * 
 * // Server usage with API key
 * const client = new AuthModulesClient({
 *   baseUrl: 'http://localhost:3000',
 *   apiKey: 'your-api-key'
 * });
 * ```
 */
export class AuthModulesClient {
  /**
   * HTTP client instance
   */
  private readonly http: HttpClient;

  /**
   * Authentication resource
   * Provides login, register, logout, and token management
   */
  public readonly auth: AuthResource;

  /**
   * Users resource
   * Provides user CRUD operations (Super Admin only)
   */
  public readonly users: UsersResource;

  /**
   * Projects resource
   * Provides project CRUD operations (Admin/Super Admin)
   */
  public readonly projects: ProjectsResource;

  /**
   * Roles resource
   * Provides role CRUD operations (Super Admin only)
   */
  public readonly roles: RolesResource;

  /**
   * Assignments resource
   * Provides project assignment operations (Admin only)
   */
  public readonly assignments: AssignmentsResource;

  /**
   * Audit Logs resource
   * Provides read-only audit log access (Super Admin only)
   */
  public readonly auditLogs: AuditLogsResource;

  /**
   * Create a new Auth Modules SDK client
   * 
   * @param config - SDK configuration options
   * 
   * @example
   * ```ts
   * // Basic browser setup
   * const client = new AuthModulesClient({
   *   baseUrl: 'https://api.example.com'
   * });
   * 
   * // With custom timeout
   * const client = new AuthModulesClient({
   *   baseUrl: 'https://api.example.com',
   *   timeout: 60000
   * });
   * 
   * // Server-to-server with API key
   * const client = new AuthModulesClient({
   *   baseUrl: 'https://api.example.com',
   *   apiKey: process.env.AUTH_API_KEY
   * });
   * 
   * // With custom storage
   * const client = new AuthModulesClient({
   *   baseUrl: 'https://api.example.com',
   *   storage: myCustomStorage
   * });
   * ```
   */
  constructor(config: SDKConfig) {
    if (!config.baseUrl) {
      throw new SDKError(
        'baseUrl is required',
        400,
        'CONFIG_ERROR'
      );
    }

    this.http = new HttpClient(config);

    // Initialize all resources
    this.auth = new AuthResource(this.http);
    this.users = new UsersResource(this.http);
    this.projects = new ProjectsResource(this.http);
    this.roles = new RolesResource(this.http);
    this.assignments = new AssignmentsResource(this.http);
    this.auditLogs = new AuditLogsResource(this.http);
  }

  /**
   * Check if the client is authenticated
   * 
   * @returns True if authenticated with valid token
   */
  async isAuthenticated(): Promise<boolean> {
    return this.auth.isAuthenticated();
  }
}

// ============================================================================
// Export all types and utilities
// ============================================================================

// Export main client
export { AuthModulesClient as default };

// Export HTTP client utilities
export { HttpClient, MemoryStorage, LocalStorageAdapter };

// Export all types
export * from './types';

// Export all resources
export {
  AuthResource,
  UsersResource,
  ProjectsResource,
  RolesResource,
  AssignmentsResource,
  AuditLogsResource,
} from './resources';

/**
 * Create a new Auth Modules client instance
 * Convenience factory function
 * 
 * @param config - SDK configuration
 * @returns AuthModulesClient instance
 * 
 * @example
 * ```ts
 * const client = createClient({
 *   baseUrl: 'http://localhost:3000'
 * });
 * ```
 */
export function createClient(config: SDKConfig): AuthModulesClient {
  return new AuthModulesClient(config);
}

/**
 * Auth Modules SDK - Type Definitions
 * Shared types extracted from backend models
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * SDK Configuration options
 */
export interface SDKConfig {
  /** Base URL of the Auth Modules API */
  baseUrl: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Acceptable clock skew in seconds when checking token expiry (default: 60) */
  clockSkewSeconds?: number;
  /** Storage adapter for token persistence */
  storage?: StorageAdapter;
  /** API Key for server-to-server authentication */
  apiKey?: string;
  /** Custom headers to include in all requests */
  headers?: Record<string, string>;
}

/**
 * Storage adapter interface for token persistence
 * Can be implemented for localStorage, sessionStorage, cookies, or custom storage
 */
export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  /** Skip authentication header */
  skipAuth?: boolean;
  /** Custom headers for this request */
  headers?: Record<string, string>;
  /** Request timeout override */
  timeout?: number;
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
}

// ============================================================================
// Auth Types
// ============================================================================

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
  project_key: string;
}

/**
 * Login response data
 */
export interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  project_id: number;
  project_key: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  project_key: string;
}

/**
 * Register response data
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * Public key response
 */
export interface PublicKeyResponse {
  publicKey: string;
}

// ============================================================================
// User Types
// ============================================================================

/**
 * User entity
 */
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

/**
 * User with assignments detail
 */
export interface UserDetail extends User {
  assignments: UserAssignment[];
}

/**
 * User assignment info
 */
export interface UserAssignment {
  project_id: number;
  project_name: string;
  project_key: string;
  role_id: number;
  role_name: string;
}

/**
 * Create user request payload
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Update user request payload
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

/**
 * List users response
 */
export interface ListUsersResponse {
  success: boolean;
  users: User[];
}

/**
 * User detail response
 */
export interface UserDetailResponse {
  success: boolean;
  user: UserDetail;
}

/**
 * Create user response
 */
export interface CreateUserResponse {
  success: boolean;
  user: User;
}

/**
 * Update user response
 */
export interface UpdateUserResponse {
  success: boolean;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

/**
 * Delete user response
 */
export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Project Types
// ============================================================================

/**
 * Project entity
 */
export interface Project {
  id: number;
  name: string;
  project_key: string;
  base_url: string | null;
  created_at?: string;
}

/**
 * Create project request payload
 */
export interface CreateProjectRequest {
  name: string;
  base_url?: string;
}

/**
 * Update project request payload
 */
export interface UpdateProjectRequest {
  name?: string;
  base_url?: string | null;
}

/**
 * List projects response
 */
export interface ListProjectsResponse {
  success: boolean;
  projects: Project[];
}

/**
 * Create project response
 */
export interface CreateProjectResponse {
  success: boolean;
  project: Omit<Project, 'created_at'>;
}

/**
 * Update project response
 */
export interface UpdateProjectResponse {
  success: boolean;
  project: Project;
}

/**
 * Delete project response
 */
export interface DeleteProjectResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Role Types
// ============================================================================

/**
 * Role entity
 */
export interface Role {
  id: number;
  name: string;
  description: string | null;
}

/**
 * Create role request payload
 */
export interface CreateRoleRequest {
  name: string;
  description?: string;
}

/**
 * Update role request payload
 */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

/**
 * List roles response
 */
export interface ListRolesResponse {
  success: boolean;
  roles: Role[];
}

/**
 * Create role response
 */
export interface CreateRoleResponse {
  success: boolean;
  role: Role;
}

/**
 * Update role response
 */
export interface UpdateRoleResponse {
  success: boolean;
  role: Role;
}

/**
 * Delete role response
 */
export interface DeleteRoleResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Assignment Types
// ============================================================================

/**
 * Assignment entity
 */
export interface Assignment {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  project_id: number;
  project_name: string;
  project_key: string;
  role_id: number;
  role_name: string;
  created_at: string;
}

/**
 * Create assignment request payload
 */
export interface CreateAssignmentRequest {
  user_id: number;
  project_id: number;
  role_id: number;
}

/**
 * Create assignment response
 */
export interface CreateAssignmentResponse {
  success: boolean;
  assignment: {
    id: number;
    user_id: number;
    project_id: number;
    role_id: number;
    user_name: string;
    project_name: string;
    role_name: string;
    created_at: string;
  };
}

/**
 * List assignments response
 */
export interface ListAssignmentsResponse {
  success: boolean;
  assignments: Assignment[];
}

/**
 * List assignments query params
 */
export interface ListAssignmentsParams {
  project_id?: number;
}

/**
 * Delete assignment query params
 */
export interface DeleteAssignmentParams {
  user_id: number;
  project_id: number;
}

/**
 * Delete assignment response
 */
export interface DeleteAssignmentResponse {
  success: boolean;
  message: string;
}

/**
 * List assignment roles response
 */
export interface ListAssignmentRolesResponse {
  success: boolean;
  roles: Role[];
}

// ============================================================================
// Audit Log Types
// ============================================================================

/**
 * Entity type for audit logs
 */
export type AuditEntityType = 'user' | 'role';

/**
 * Action type for audit logs
 */
export type AuditAction = 'create' | 'update' | 'delete';

/**
 * Audit log entry
 */
export interface AuditLog {
  id: number;
  entity_type: AuditEntityType;
  entity_id: number;
  action: AuditAction;
  actor_id: number;
  actor_name: string;
  changes: Record<string, unknown> | null;
  created_at: string;
}

/**
 * List audit logs query params
 */
export interface ListAuditLogsParams {
  entity_type?: AuditEntityType;
  entity_id?: number;
  actor_id?: number;
  action?: AuditAction;
  limit?: number;
  offset?: number;
}

/**
 * List audit logs response
 */
export interface ListAuditLogsResponse {
  success: boolean;
  logs: AuditLog[];
  total: number;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * API Error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
}

/**
 * SDK Error class for custom error handling
 */
export class SDKError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly response?: ApiErrorResponse;

  constructor(message: string, status = 500, code = 'SDK_ERROR', response?: ApiErrorResponse) {
    super(message);
    this.name = 'SDKError';
    this.status = status;
    this.code = code;
    this.response = response;

    // Maintains proper stack trace for where error was thrown (only in V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SDKError);
    }
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is a permission error
   */
  isPermissionError(): boolean {
    return this.status === 403;
  }

  /**
   * Check if error is a not found error
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.status === 400;
  }

  /**
   * Check if error is a network/timeout error
   */
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT_ERROR';
  }
}

// ============================================================================
// Token Types
// ============================================================================

/**
 * Decoded JWT token payload
 */
export interface TokenPayload {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  data: {
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Token storage keys
 */
export const TOKEN_STORAGE_KEY = 'auth_modules_token';
export const USER_STORAGE_KEY = 'auth_modules_user';

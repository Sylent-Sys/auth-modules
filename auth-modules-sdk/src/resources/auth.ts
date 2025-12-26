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
 * Auth Resource - Authentication related API calls
 */

import type { HttpClient } from '../http-client';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  PublicKeyResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types';

/**
 * API path prefix for auth endpoints
 */
const BASE_PATH = '/api/v1/auth';

/**
 * Auth resource class for authentication operations
 */
export class AuthResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Login to a project
   *
   * @param credentials - Login credentials (email, password, project_key)
   * @returns Login response with token and user info
   * @throws {SDKError} On invalid credentials or server error
   *
   * @example
   * ```ts
   * const response = await client.auth.login({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   project_key: 'my-project'
   * });
   * console.log(response.user);
   * ```
   */
  async login(credentials: LoginRequest, options?: { persist?: boolean }): Promise<LoginResponse> {
    const response = await this.http.post<LoginResponse>(`${BASE_PATH}/login`, credentials, {
      skipAuth: true,
    });

    // Persist token and user info on successful login unless caller opts out
    if (response.success && response.token && options?.persist !== false) {
      await this.http.setToken(response.token);
      await this.http.setStoredUser(response.user);
    }

    return response;
  }

  /**
   * Register a new user
   *
   * @param data - Registration data (name, email, password, project_key)
   * @returns Registration response with user info
   * @throws {SDKError} On validation error or if user already exists
   *
   * @example
   * ```ts
   * const response = await client.auth.register({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   password: 'password123',
   *   project_key: 'my-project'
   * });
   * console.log(response.message);
   * ```
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${BASE_PATH}/register`, data, { skipAuth: true });
  }

  /**
   * Logout current user
   * Clears stored token and user data
   *
   * @example
   * ```ts
   * await client.auth.logout();
   * ```
   */
  async logout(): Promise<void> {
    await this.http.removeToken();
    await this.http.removeStoredUser();
  }

  /**
   * Get JWT public key for token verification
   *
   * @returns Public key response
   * @throws {SDKError} On server error
   *
   * @example
   * ```ts
   * const { publicKey } = await client.auth.getPublicKey();
   * ```
   */
  async getPublicKey(): Promise<PublicKeyResponse> {
    return this.http.get<PublicKeyResponse>(`${BASE_PATH}/public-key`, { skipAuth: true });
  }

  /**
   * Get current authenticated user from storage
   * Does NOT make an API call
   *
   * @returns User info or null if not authenticated
   *
   * @example
   * ```ts
   * const user = await client.auth.getCurrentUser();
   * if (user) {
   *   console.log(`Logged in as ${user.name}`);
   * }
   * ```
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    return this.http.getStoredUser();
  }

  /**
   * Check if user is authenticated
   * Checks for valid, non-expired token
   *
   * @returns True if authenticated
   *
   * @example
   * ```ts
   * if (await client.auth.isAuthenticated()) {
   *   // User is logged in
   * }
   * ```
   */
  async isAuthenticated(): Promise<boolean> {
    return this.http.isAuthenticated();
  }

  /**
   * Get current access token
   *
   * @returns Access token or null
   *
   * @example
   * ```ts
   * const token = await client.auth.getToken();
   * ```
   */
  async getToken(): Promise<string | null> {
    return this.http.getToken();
  }

  /**
   * Set access token manually
   * Useful for restoring session from external source
   *
   * @param token - JWT access token
   *
   * @example
   * ```ts
   * await client.auth.setToken(savedToken);
   * ```
   */
  async setToken(token: string): Promise<void> {
    return this.http.setToken(token);
  }
}

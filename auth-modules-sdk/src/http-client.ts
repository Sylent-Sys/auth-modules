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
 * Auth Modules SDK - Core HTTP Client
 * Provides the base HTTP client with interceptors and authentication handling
 */

import {
  type ApiErrorResponse,
  type AuthUser,
  type RequestOptions,
  type SDKConfig,
  SDKError,
  type StorageAdapter,
  TOKEN_STORAGE_KEY,
  type TokenPayload,
  USER_STORAGE_KEY,
} from './types';

import { jwtDecode } from 'jwt-decode';

/**
 * Default in-memory storage for environments without localStorage
 */
class MemoryStorage implements StorageAdapter {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }
}

/**
 * Browser localStorage adapter
 */
class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(key);
  }
}

/**
 * Get default storage adapter based on environment
 */
function getDefaultStorage(): StorageAdapter {
  if (typeof window !== 'undefined' && window.localStorage) {
    return new LocalStorageAdapter();
  }
  return new MemoryStorage();
}

/**
 * Decode a JWT token without verification (for reading expiry, etc.)
 */
function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = jwtDecode<TokenPayload>(token);
    return payload ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp - bufferSeconds <= now;
}

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Core HTTP client for Auth Modules SDK
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly storage: StorageAdapter;
  private readonly apiKey?: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly clockSkewSeconds: number;

  constructor(config: SDKConfig) {
    // Remove trailing slash from base URL
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.timeout = config.timeout ?? 30000;
    this.storage = config.storage ?? getDefaultStorage();
    this.apiKey = config.apiKey;
    this.clockSkewSeconds = config.clockSkewSeconds ?? 60;
    this.defaultHeaders = config.headers ?? {};
  }

  /**
   * Get the current access token from storage
   */
  async getToken(): Promise<string | null> {
    const token = await this.storage.getItem(TOKEN_STORAGE_KEY);
    return token;
  }

  /**
   * Set the access token in storage
   */
  async setToken(token: string): Promise<void> {
    await this.storage.setItem(TOKEN_STORAGE_KEY, token);
  }

  /**
   * Remove the access token from storage
   */
  async removeToken(): Promise<void> {
    await this.storage.removeItem(TOKEN_STORAGE_KEY);
  }

  /**
   * Get the stored user from storage
   */
  async getStoredUser(): Promise<AuthUser | null> {
    const userJson = await this.storage.getItem(USER_STORAGE_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AuthUser;
    } catch {
      return null;
    }
  }

  /**
   * Set the user in storage
   */
  async setStoredUser(user: AuthUser): Promise<void> {
    await this.storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Remove the user from storage
   */
  async removeStoredUser(): Promise<void> {
    await this.storage.removeItem(USER_STORAGE_KEY);
  }

  /**
   * Check if current token is valid and not expired
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;
    return !isTokenExpired(token, this.clockSkewSeconds);
  }

  /**
   * Get decoded token payload
   */
  async getTokenPayload(): Promise<TokenPayload | null> {
    const token = await this.getToken();
    if (!token) return null;
    return decodeToken(token);
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(`${this.baseUrl}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Build headers for request
   */
  private async buildHeaders(options?: RequestOptions): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...options?.headers,
    });

    // Add API key if configured (for server-to-server)
    if (this.apiKey) {
      headers.set('X-API-Key', this.apiKey);
    }

    // Add Bearer token if authenticated and not skipped
    if (!options?.skipAuth) {
      const token = await this.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Execute HTTP request with timeout
   */
  private async executeWithTimeout(
    url: string,
    init: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new SDKError('Request timeout', 408, 'TIMEOUT_ERROR');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Parse response body
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  /**
   * Make HTTP request
   */
  async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const headers = await this.buildHeaders(options);
    const timeout = options?.timeout ?? this.timeout;

    const init: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      init.body = JSON.stringify(body);
    }

    try {
      const response = await this.executeWithTimeout(url, init, timeout);
      const data = await this.parseResponse<T>(response);

      if (!response.ok) {
        const errorResponse = data as unknown as ApiErrorResponse;
        throw new SDKError(
          errorResponse.error || `HTTP ${response.status}`,
          response.status,
          `HTTP_${response.status}`,
          errorResponse
        );
      }

      return data;
    } catch (error) {
      if (error instanceof SDKError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new SDKError('Network error: Unable to reach the server', 0, 'NETWORK_ERROR');
      }

      throw new SDKError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

// Re-export storage adapters for custom implementations
export { MemoryStorage, LocalStorageAdapter };

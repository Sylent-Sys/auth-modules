# Auth Modules SDK

Isomorphic TypeScript SDK for **Auth Modules REST API** — works seamlessly in both **Browser** (React, Vue, etc.) and **Server** (Node.js, Bun, Deno) environments.

## Features

- 🌐 **Isomorphic** - Single codebase for client and server
- 📘 **Full TypeScript** - Complete type definitions with strict mode
- 🔐 **Auto Authentication** - Automatic Bearer token injection
- 💾 **Flexible Storage** - localStorage, memory, or custom adapters
- ⚡ **Promise-based** - Modern async/await API
- 🛡️ **Error Handling** - Custom `SDKError` with helper methods
- 📦 **Zero Dependencies** - Uses native `fetch`

## Installation

```bash
# Using npm
npm install auth-modules-sdk

# Using bun
bun add auth-modules-sdk

# Using pnpm
pnpm add auth-modules-sdk
```

## Quick Start

### Browser (React Example)

```tsx
import { AuthModulesClient, SDKError } from 'auth-modules-sdk';

// Create client instance (singleton recommended)
const client = new AuthModulesClient({
  baseUrl: 'http://localhost:3000',
  timeout: 30000, // 30 seconds
});

// Login
async function handleLogin(email: string, password: string, projectKey: string) {
  try {
    const response = await client.auth.login({
      email,
      password,
      project_key: projectKey,
    });
    
    console.log('Logged in as:', response.user.name);
    // Token is automatically stored in localStorage
    return response.user;
  } catch (error) {
    if (error instanceof SDKError) {
      if (error.isAuthError()) {
        console.error('Invalid credentials');
      } else {
        console.error('Login failed:', error.message);
      }
    }
    throw error;
  }
}

// Check authentication status
async function checkAuth() {
  const isAuthenticated = await client.auth.isAuthenticated();
  if (isAuthenticated) {
    const user = await client.auth.getCurrentUser();
    console.log('Current user:', user);
  }
}

// Logout
async function handleLogout() {
  await client.auth.logout();
}
```

### React Hook Example

```tsx
// hooks/useAuthClient.ts
import { useMemo } from 'react';
import { AuthModulesClient } from 'auth-modules-sdk';

let clientInstance: AuthModulesClient | null = null;

export function useAuthClient() {
  return useMemo(() => {
    if (!clientInstance) {
      clientInstance = new AuthModulesClient({
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      });
    }
    return clientInstance;
  }, []);
}

// Usage in component
function LoginPage() {
  const client = useAuthClient();
  const [loading, setLoading] = useState(false);
  
  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await client.auth.login({
        email: data.email,
        password: data.password,
        project_key: data.projectKey,
      });
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  
  // ...
}
```

### Server-Side (Node.js/Bun Example)

```ts
import { AuthModulesClient, MemoryStorage, SDKError } from 'auth-modules-sdk';

// For server-to-server, use memory storage
const client = new AuthModulesClient({
  baseUrl: process.env.AUTH_API_URL || 'http://localhost:3000',
  storage: new MemoryStorage(),
  // Optional: API key for server authentication
  apiKey: process.env.AUTH_API_KEY,
  timeout: 10000,
});

// Example: Admin script to list all users
async function listAllUsers() {
  try {
    // First, login as admin
    await client.auth.login({
      email: 'admin@example.com',
      password: 'admin-password',
      project_key: 'admin-project',
    });

    // Now fetch users (requires super_admin role)
    const { users } = await client.users.list();
    
    console.log('Users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });

    return users;
  } catch (error) {
    if (error instanceof SDKError) {
      console.error(`API Error [${error.status}]: ${error.message}`);
    }
    throw error;
  }
}

// Example: Create a new project
async function createProject(name: string, baseUrl?: string) {
  try {
    const { project } = await client.projects.create({
      name,
      base_url: baseUrl,
    });
    
    console.log(`Created project: ${project.name} (key: ${project.project_key})`);
    return project;
  } catch (error) {
    if (error instanceof SDKError && error.isPermissionError()) {
      console.error('Admin access required');
    }
    throw error;
  }
}
```

## API Reference

### AuthModulesClient

Main client class that provides access to all resources.

```ts
const client = new AuthModulesClient({
  baseUrl: string;       // Required: API base URL
  timeout?: number;      // Request timeout in ms (default: 30000)
  storage?: StorageAdapter; // Token storage adapter
  apiKey?: string;       // API key for server-to-server auth
  headers?: Record<string, string>; // Custom headers
});
```

### Resources

#### `client.auth` - Authentication

| Method | Description |
|--------|-------------|
| `login(credentials)` | Login and get JWT token |
| `register(data)` | Register new user |
| `logout()` | Clear stored token and user |
| `getPublicKey()` | Get JWT public key |
| `getCurrentUser()` | Get stored user (no API call) |
| `isAuthenticated()` | Check if token is valid |
| `getToken()` | Get current token |
| `setToken(token)` | Set token manually |

#### `client.users` - User Management (Super Admin)

| Method | Description |
|--------|-------------|
| `list()` | List all users |
| `getById(id)` | Get user with assignments |
| `create(data)` | Create new user |
| `update(id, data)` | Update user |
| `delete(id)` | Delete user |

#### `client.projects` - Project Management (Admin)

| Method | Description |
|--------|-------------|
| `list()` | List all projects |
| `create(data)` | Create new project |
| `update(id, data)` | Update project (Super Admin) |
| `delete(id)` | Delete project (Super Admin) |

#### `client.roles` - Role Management (Super Admin)

| Method | Description |
|--------|-------------|
| `list()` | List all roles |
| `create(data)` | Create new role |
| `update(id, data)` | Update role |
| `delete(id)` | Delete role |

#### `client.assignments` - Project Assignments (Admin)

| Method | Description |
|--------|-------------|
| `list(params?)` | List assignments (optionally by project) |
| `create(data)` | Assign user to project |
| `delete(params)` | Remove assignment |
| `listRoles()` | List available roles |

#### `client.auditLogs` - Audit Logs (Super Admin)

| Method | Description |
|--------|-------------|
| `list(params?)` | List audit logs with filters |

### Error Handling

```ts
import { SDKError } from 'auth-modules-sdk';

try {
  await client.users.list();
} catch (error) {
  if (error instanceof SDKError) {
    // Check error type
    if (error.isAuthError()) {
      // 401 - Not authenticated
      redirectToLogin();
    } else if (error.isPermissionError()) {
      // 403 - Not authorized
      showAccessDenied();
    } else if (error.isNotFoundError()) {
      // 404 - Resource not found
      showNotFound();
    } else if (error.isValidationError()) {
      // 400 - Bad request
      showValidationErrors(error.response?.error);
    } else if (error.isNetworkError()) {
      // Network/timeout error
      showNetworkError();
    }
    
    // Access error details
    console.log({
      message: error.message,
      status: error.status,
      code: error.code,
      response: error.response,
    });
  }
}
```

### Custom Storage Adapter

```ts
import { StorageAdapter, AuthModulesClient } from 'auth-modules-sdk';

// Example: Cookie-based storage
class CookieStorage implements StorageAdapter {
  getItem(key: string): string | null {
    const match = document.cookie.match(new RegExp(`${key}=([^;]+)`));
    return match ? match[1] : null;
  }
  
  setItem(key: string, value: string): void {
    document.cookie = `${key}=${value}; path=/; max-age=86400; SameSite=Strict`;
  }
  
  removeItem(key: string): void {
    document.cookie = `${key}=; path=/; max-age=0`;
  }
}

const client = new AuthModulesClient({
  baseUrl: 'http://localhost:3000',
  storage: new CookieStorage(),
});
```

### Types

All types are exported for TypeScript users:

```ts
import type {
  // Auth
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthUser,
  
  // Users
  User,
  UserDetail,
  CreateUserRequest,
  UpdateUserRequest,
  
  // Projects
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  
  // Roles
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  
  // Assignments
  Assignment,
  CreateAssignmentRequest,
  
  // Audit Logs
  AuditLog,
  ListAuditLogsParams,
  
  // Core
  SDKConfig,
  StorageAdapter,
  SDKError,
} from 'auth-modules-sdk';
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Type check
bun run typecheck

# Watch mode
bun run dev
```

## License

Copyright (C) 2025 Renaldi Apriyanto Kadang

This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.

You are free to use, modify, and distribute this software, but **if you run a modified version of this software over a network (e.g., as a SaaS backend), you MUST make the full source code of your modified version available to the users of that service.**

See the [LICENSE](../LICENSE) file for details.


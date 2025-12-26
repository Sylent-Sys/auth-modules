# Auth Modules Backend

Centralized Authentication Service with Project-Scoped SSO and RBAC.

## Features

- **Project-Scoped JWT**: Tokens are scoped to specific projects
- **RBAC**: Role-based access control per project
- **RS256 Signing**: Asymmetric JWT signing for secure token validation
- **OpenAPI Documentation**: Auto-generated API docs

## Quick Start

### 1. Install dependencies
```bash
bun install
```

### 2. Setup environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database URL and JWT keys.

### 3. Generate JWT Keys
```bash
bun run src/scripts/generate-keys.ts
```

Copy the output keys to your `.env.local` file.

### 4. Run migrations
```bash
bun run src/migrations/migrate.ts up
```

### 5. Start development server
```bash
bun run --watch src/index.ts
```

Open http://localhost:3000/ to see the API.  
Open http://localhost:3000/openapi for OpenAPI documentation.

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with email, password, project_key |
| POST | `/api/v1/auth/register` | Register new user to a project |
| GET | `/api/v1/auth/public-key` | Get JWT public key (PEM format) |

### Protected Endpoints (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/projects` | Create new project |
| GET | `/api/v1/projects` | List all projects |
| POST | `/api/v1/assignments` | Assign user to project |
| GET | `/api/v1/assignments` | List all assignments |
| DELETE | `/api/v1/assignments` | Remove assignment |
| GET | `/api/v1/assignments/roles` | List all roles |

## Project Structure

```
src/
├── index.ts              # Main entry point
├── lib/
│   ├── db.ts             # Database connection
│   ├── jwt.ts            # JWT RS256 utilities
│   ├── middleware.ts     # Auth guard middleware
│   └── password.ts       # Password hashing (Argon2)
├── modules/
│   ├── auth/             # Authentication module
│   │   ├── index.ts      # Controller
│   │   ├── service.ts    # Business logic
│   │   └── model.ts      # DTO definitions
│   ├── projects/         # Project management
│   └── assignments/      # User-Project assignments
├── migrations/
│   ├── migrate.ts        # Migration runner
│   ├── table/            # Schema migrations
│   └── seed/             # Seed data
└── scripts/
    └── generate-keys.ts  # JWT key generator
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `PORT` | Server port (default: 3000) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `JWT_ISSUER` | JWT issuer claim |
| `JWT_EXPIRES_IN` | Token expiry in seconds |
| `JWT_PRIVATE_KEY` | RS256 private key (PEM) |
| `JWT_PUBLIC_KEY` | RS256 public key (PEM) |

## License

Copyright (C) 2025 Renaldi Apriyanto Kadang

This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.

You are free to use, modify, and distribute this software, but **if you run a modified version of this software over a network (e.g., as a SaaS backend), you MUST make the full source code of your modified version available to the users of that service.**

See the [LICENSE](../LICENSE) file for details.
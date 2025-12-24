import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";

// Import modules
import { authController } from "./modules/auth";
import { projectsController } from "./modules/projects";
import { assignmentsController } from "./modules/assignments";
import { usersController } from "./modules/users";
import { rolesController } from "./modules/roles";
import { auditLogsController } from "./modules/audit-logs";
import { initCorsOrigins, isOriginAllowed } from "./lib/cors";

const PORT = process.env.PORT || 3000;

// Initialize CORS origins sebelum start server
await initCorsOrigins();

const app = new Elysia()
	.use(
		cors({
			// Dynamic origin validation dari tabel projects
			origin: (request) => {
				const origin = request.headers.get("origin");
				if (!origin) return true; // Allow requests without origin (e.g., Postman)

				// Jika CORS_ORIGINS = "*", allow semua
				if (process.env.CORS_ORIGINS === "*") return true;

				return isOriginAllowed(origin);
			},
			credentials: true,
		}),
	)
	.use(
		openapi({
			documentation: {
				info: {
					title: "Auth Modules API",
					version: "1.0.0",
					description:
						"Centralized authentication service with Project-Scoped SSO and RBAC",
				},
				tags: [
					{ name: "Auth", description: "Authentication endpoints" },
					{ name: "Projects", description: "Project management (Admin)" },
					{
						name: "Assignments",
						description: "User-Project assignments (Admin)",
					},
					{ name: "Users", description: "User management (Super Admin)" },
					{ name: "Roles", description: "Role management (Super Admin)" },
					{ name: "Audit Logs", description: "Audit logs (Super Admin)" },
				],
			},
		}),
	)
	// Health check
	.get("/", () => ({
		status: "ok",
		service: "Auth Modules",
		version: "1.0.0",
	}))
	// API v1 routes
	.group("/api/v1", (app) =>
		app
			.use(authController)
			.use(projectsController)
			.use(assignmentsController)
			.use(usersController)
			.use(rolesController)
			.use(auditLogsController),
	)
	// Error handler
	.onError(({ code, error, set }) => {
		if (code === "VALIDATION") {
			set.status = 400;
			return { success: false, error: error.message };
		}
		if (code === "NOT_FOUND") {
			set.status = 404;
			return { success: false, error: "Not found" };
		}
		console.error("Unhandled error:", error);
		set.status = 500;
		return { success: false, error: "Internal server error" };
	})
	.listen(PORT);

export type App = typeof app;

console.log(
	`Auth Modules API running at ${app.server?.hostname}:${app.server?.port} (PID: ${process.pid})`,
);
console.log(`OpenAPI docs: http://localhost:${PORT}/openapi`);

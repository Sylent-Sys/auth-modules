// Projects Controller - HTTP routing for project management (Protected)
import { Elysia } from "elysia";
import { authGuard } from "../../lib/middleware";
import { ProjectService } from "./service";
import { ProjectModel } from "./model";

export const projectsController = new Elysia({
	prefix: "/projects",
	tags: ["Projects"],
})
	.use(authGuard)

	// POST /projects - Create new project (Admin only)
	.post(
		"/",
		async ({ body, set }) => {
			const result = await ProjectService.create(body.name, body.base_url);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			set.status = 201;
			return {
				success: true,
				project: result.project,
			};
		},
		{
			isAdmin: true,
			body: ProjectModel.createBody,
			response: {
				201: ProjectModel.createResponse,
				400: ProjectModel.errorResponse,
				401: ProjectModel.errorResponse,
				403: ProjectModel.errorResponse,
				409: ProjectModel.errorResponse,
			},
			detail: {
				summary: "Create a new project",
				description:
					"Create a new project with auto-generated project_key. Requires admin access.",
			},
		},
	)

	// GET /projects - List all projects (Admin only)
	.get(
		"/",
		async () => {
			const projects = await ProjectService.list();

			return {
				success: true,
				projects: projects.map((p) => ({
					...p,
					created_at: String(p.created_at),
				})),
			};
		},
		{
			isAdmin: true,
			response: {
				200: ProjectModel.listResponse,
				401: ProjectModel.errorResponse,
				403: ProjectModel.errorResponse,
			},
			detail: {
				summary: "List all projects",
				description:
					"Get a list of all registered projects. Requires admin access.",
			},
		},
	);

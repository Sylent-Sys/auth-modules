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

// Projects Controller - HTTP routing for project management (Protected)
import { Elysia, t } from "elysia";
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
	)

	// PUT /projects/:id - Update project (Super Admin only)
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const result = await ProjectService.update(params.id, body);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			return {
				success: true,
				project: {
					...result.project,
					created_at: String(result.project.created_at),
				},
			};
		},
		{
			isSuperAdmin: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			body: ProjectModel.updateBody,
			response: {
				200: ProjectModel.updateResponse,
				401: ProjectModel.errorResponse,
				403: ProjectModel.errorResponse,
				404: ProjectModel.errorResponse,
				409: ProjectModel.errorResponse,
			},
			detail: {
				summary: "Update project",
				description:
					"Update project name or base_url. Requires super admin access.",
			},
		},
	)

	// DELETE /projects/:id - Delete project (Super Admin only)
	.delete(
		"/:id",
		async ({ params, set }) => {
			const result = await ProjectService.delete(params.id);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			return { success: true, message: "Project deleted successfully" };
		},
		{
			isSuperAdmin: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			response: {
				200: ProjectModel.deleteResponse,
				401: ProjectModel.errorResponse,
				403: ProjectModel.errorResponse,
				404: ProjectModel.errorResponse,
				409: ProjectModel.errorResponse,
			},
			detail: {
				summary: "Delete project",
				description:
					"Delete a project. Cannot delete if project has active assignments. Requires super admin access.",
			},
		},
	);

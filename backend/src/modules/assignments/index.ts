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

// Assignments Controller - HTTP routing for project assignments (Protected)
import { Elysia, t } from "elysia";
import { authGuard } from "../../lib/middleware";
import { AssignmentService } from "./service";
import { AssignmentModel } from "./model";

export const assignmentsController = new Elysia({
	prefix: "/assignments",
	tags: ["Assignments"],
})
	.use(authGuard)

	// POST /assignments - Create/update assignment (Admin only)
	.post(
		"/",
		async ({ body, set }) => {
			const result = await AssignmentService.create(
				body.user_id,
				body.project_id,
				body.role_id,
			);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			set.status = 201;
			return {
				success: true,
				assignment: {
					...result.assignment,
					created_at: String(result.assignment.created_at),
				},
			};
		},
		{
			isAdmin: true,
			body: AssignmentModel.createBody,
			response: {
				201: AssignmentModel.createResponse,
				401: AssignmentModel.errorResponse,
				403: AssignmentModel.errorResponse,
				404: AssignmentModel.errorResponse,
			},
			detail: {
				summary: "Assign user to project",
				description:
					"Assign a user to a project with a specific role. If assignment exists, updates the role. Requires admin access.",
			},
		},
	)

	// GET /assignments - List all assignments (Admin only)
	.get(
		"/",
		async ({ query }) => {
			const assignments = await AssignmentService.list(query.project_id);

			return {
				success: true,
				assignments: assignments.map((a) => ({
					...a,
					created_at: String(a.created_at),
				})),
			};
		},
		{
			isAdmin: true,
			query: t.Object({
				project_id: t.Optional(t.Numeric()),
			}),
			response: {
				200: AssignmentModel.listResponse,
				401: AssignmentModel.errorResponse,
				403: AssignmentModel.errorResponse,
			},
			detail: {
				summary: "List assignments",
				description:
					"List all project assignments. Optionally filter by project_id. Requires admin access.",
			},
		},
	)

	// DELETE /assignments - Remove assignment (Admin only)
	.delete(
		"/",
		async ({ query, set }) => {
			const result = await AssignmentService.delete(
				query.user_id,
				query.project_id,
			);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			return { success: true, message: "Assignment deleted" };
		},
		{
			isAdmin: true,
			query: t.Object({
				user_id: t.Numeric(),
				project_id: t.Numeric(),
			}),
			response: {
				200: t.Object({
					success: t.Boolean(),
					message: t.String(),
				}),
				401: AssignmentModel.errorResponse,
				403: AssignmentModel.errorResponse,
				404: AssignmentModel.errorResponse,
			},
			detail: {
				summary: "Delete assignment",
				description:
					"Remove a user's assignment from a project. Requires admin access.",
			},
		},
	)

	// GET /assignments/roles - List all roles (Admin only)
	.get(
		"/roles",
		async () => {
			const roles = await AssignmentService.listRoles();
			return { success: true, roles };
		},
		{
			isAdmin: true,
			response: {
				200: AssignmentModel.rolesResponse,
				401: AssignmentModel.errorResponse,
				403: AssignmentModel.errorResponse,
			},
			detail: {
				summary: "List roles",
				description:
					"Get a list of all available roles. Requires admin access.",
			},
		},
	);

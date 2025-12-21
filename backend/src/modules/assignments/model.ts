// Assignments Model - DTO definitions for project assignment endpoints
import { t } from "elysia";

export namespace AssignmentModel {
	// POST /assignments
	export const createBody = t.Object({
		user_id: t.Number(),
		project_id: t.Number(),
		role_id: t.Number(),
	});
	export type CreateBody = typeof createBody.static;

	export const createResponse = t.Object({
		success: t.Boolean(),
		assignment: t.Object({
			id: t.Number(),
			user_id: t.Number(),
			project_id: t.Number(),
			role_id: t.Number(),
			user_name: t.String(),
			project_name: t.String(),
			role_name: t.String(),
		}),
	});
	export type CreateResponse = typeof createResponse.static;

	// GET /assignments
	export const listResponse = t.Object({
		success: t.Boolean(),
		assignments: t.Array(
			t.Object({
				id: t.Number(),
				user_id: t.Number(),
				user_name: t.String(),
				user_email: t.String(),
				project_id: t.Number(),
				project_name: t.String(),
				project_key: t.String(),
				role_id: t.Number(),
				role_name: t.String(),
				created_at: t.String(),
			}),
		),
	});
	export type ListResponse = typeof listResponse.static;

	// GET /roles
	export const rolesResponse = t.Object({
		success: t.Boolean(),
		roles: t.Array(
			t.Object({
				id: t.Number(),
				name: t.String(),
				description: t.Union([t.String(), t.Null()]),
			}),
		),
	});
	export type RolesResponse = typeof rolesResponse.static;

	// Error response
	export const errorResponse = t.Object({
		success: t.Boolean(),
		error: t.String(),
	});
	export type ErrorResponse = typeof errorResponse.static;
}

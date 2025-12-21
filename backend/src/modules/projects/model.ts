// Projects Model - DTO definitions for project endpoints
import { t } from "elysia";

export namespace ProjectModel {
	// POST /projects
	export const createBody = t.Object({
		name: t.String({ minLength: 1 }),
		base_url: t.Optional(t.String()),
	});
	export type CreateBody = typeof createBody.static;

	export const createResponse = t.Object({
		success: t.Boolean(),
		project: t.Object({
			id: t.Number(),
			name: t.String(),
			project_key: t.String(),
			base_url: t.Union([t.String(), t.Null()]),
		}),
	});
	export type CreateResponse = typeof createResponse.static;

	// GET /projects
	export const listResponse = t.Object({
		success: t.Boolean(),
		projects: t.Array(
			t.Object({
				id: t.Number(),
				name: t.String(),
				project_key: t.String(),
				base_url: t.Union([t.String(), t.Null()]),
				created_at: t.String(),
			}),
		),
	});
	export type ListResponse = typeof listResponse.static;

	// Error response
	export const errorResponse = t.Object({
		success: t.Boolean(),
		error: t.String(),
	});
	export type ErrorResponse = typeof errorResponse.static;
}

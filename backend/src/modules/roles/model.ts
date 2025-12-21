// Roles Model - DTO definitions for role management endpoints
import { t } from "elysia";

export namespace RolesModel {
	// GET /roles - List roles
	export const listResponse = t.Object({
		success: t.Boolean(),
		roles: t.Array(
			t.Object({
				id: t.Number(),
				name: t.String(),
				description: t.Nullable(t.String()),
			}),
		),
	});

	// POST /roles - Create role
	export const createBody = t.Object({
		name: t.String({ minLength: 1 }),
		description: t.Optional(t.String()),
	});

	export const createResponse = t.Object({
		success: t.Boolean(),
		role: t.Object({
			id: t.Number(),
			name: t.String(),
			description: t.Nullable(t.String()),
		}),
	});

	// PUT /roles/:id - Update role
	export const updateBody = t.Object({
		name: t.Optional(t.String({ minLength: 1 })),
		description: t.Optional(t.String()),
	});

	export const updateResponse = t.Object({
		success: t.Boolean(),
		role: t.Object({
			id: t.Number(),
			name: t.String(),
			description: t.Nullable(t.String()),
		}),
	});

	// DELETE /roles/:id
	export const deleteResponse = t.Object({
		success: t.Boolean(),
		message: t.String(),
	});

	// Error response
	export const errorResponse = t.Object({
		success: t.Boolean(),
		error: t.String(),
	});
}

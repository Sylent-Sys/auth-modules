// Users Model - DTO definitions for user management endpoints
import { t } from "elysia";

export namespace UsersModel {
	// POST /users - Create user
	export const createBody = t.Object({
		name: t.String({ minLength: 1 }),
		email: t.String({ format: "email" }),
		password: t.String({ minLength: 6 }),
	});

	export const createResponse = t.Object({
		success: t.Boolean(),
		user: t.Object({
			id: t.Number(),
			name: t.String(),
			email: t.String(),
			created_at: t.String(),
		}),
	});

	// GET /users - List users
	export const listResponse = t.Object({
		success: t.Boolean(),
		users: t.Array(
			t.Object({
				id: t.Number(),
				name: t.String(),
				email: t.String(),
				created_at: t.String(),
			}),
		),
	});

	// GET /users/:id - Get user detail
	export const detailResponse = t.Object({
		success: t.Boolean(),
		user: t.Object({
			id: t.Number(),
			name: t.String(),
			email: t.String(),
			created_at: t.String(),
			assignments: t.Array(
				t.Object({
					project_id: t.Number(),
					project_name: t.String(),
					project_key: t.String(),
					role_id: t.Number(),
					role_name: t.String(),
				}),
			),
		}),
	});

	// PUT /users/:id - Update user
	export const updateBody = t.Object({
		name: t.Optional(t.String({ minLength: 1 })),
		email: t.Optional(t.String({ format: "email" })),
		password: t.Optional(t.String({ minLength: 6 })),
	});

	export const updateResponse = t.Object({
		success: t.Boolean(),
		user: t.Object({
			id: t.Number(),
			name: t.String(),
			email: t.String(),
		}),
	});

	// DELETE /users/:id
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

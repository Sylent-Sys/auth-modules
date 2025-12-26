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

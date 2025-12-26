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

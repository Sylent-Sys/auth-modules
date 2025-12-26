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

	// PUT /projects/:id
	export const updateBody = t.Object({
		name: t.Optional(t.String({ minLength: 1 })),
		base_url: t.Optional(t.Union([t.String(), t.Null()])),
	});
	export type UpdateBody = typeof updateBody.static;

	export const updateResponse = t.Object({
		success: t.Boolean(),
		project: t.Object({
			id: t.Number(),
			name: t.String(),
			project_key: t.String(),
			base_url: t.Union([t.String(), t.Null()]),
			created_at: t.String(),
		}),
	});
	export type UpdateResponse = typeof updateResponse.static;

	// DELETE /projects/:id
	export const deleteResponse = t.Object({
		success: t.Boolean(),
		message: t.String(),
	});
	export type DeleteResponse = typeof deleteResponse.static;

	// Error response
	export const errorResponse = t.Object({
		success: t.Boolean(),
		error: t.String(),
	});
	export type ErrorResponse = typeof errorResponse.static;
}

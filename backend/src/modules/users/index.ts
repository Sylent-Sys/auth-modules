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

// Users Controller - HTTP routing for user management (Super Admin only)
import { Elysia, t } from "elysia";
import { authGuard } from "../../lib/middleware";
import { AuditLogService } from "../../lib/audit-log";
import { UsersService } from "./service";
import { UsersModel } from "./model";

export const usersController = new Elysia({
	prefix: "/users",
	tags: ["Users"],
})
	.use(authGuard)

	// POST /users - Create new user (Super Admin only)
	.post(
		"/",
		async ({ body, set, user }) => {
			const result = await UsersService.create(
				body.name,
				body.email,
				body.password,
			);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			// Audit log
			await AuditLogService.log({
				entityType: "user",
				entityId: result.user.id,
				action: "create",
				actorId: user.id,
				actorName: user.name,
				changes: { name: body.name, email: body.email },
			});

			set.status = 201;
			return {
				success: true,
				user: {
					...result.user,
					created_at: String(result.user.created_at),
				},
			};
		},
		{
			isSuperAdmin: true,
			body: UsersModel.createBody,
			response: {
				201: UsersModel.createResponse,
				401: UsersModel.errorResponse,
				403: UsersModel.errorResponse,
				409: UsersModel.errorResponse,
			},
			detail: {
				summary: "Create a new user",
				description: "Create a new user account. Requires super admin access.",
			},
		},
	)

	// GET /users - List all users
	.get(
		"/",
		async () => {
			const users = await UsersService.list();

			return {
				success: true,
				users: users.map((u) => ({
					...u,
					created_at: String(u.created_at),
				})),
			};
		},
		{
			isSuperAdmin: true,
			response: {
				200: UsersModel.listResponse,
				401: UsersModel.errorResponse,
				403: UsersModel.errorResponse,
			},
			detail: {
				summary: "List all users",
				description:
					"Get a list of all registered users. Requires super admin access.",
			},
		},
	)

	// GET /users/:id - Get user detail
	.get(
		"/:id",
		async ({ params, set }) => {
			const result = await UsersService.getById(params.id);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			return {
				success: true,
				user: {
					...result.user,
					created_at: String(result.user.created_at),
				},
			};
		},
		{
			isSuperAdmin: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			response: {
				200: UsersModel.detailResponse,
				401: UsersModel.errorResponse,
				403: UsersModel.errorResponse,
				404: UsersModel.errorResponse,
			},
			detail: {
				summary: "Get user detail",
				description:
					"Get user information including project assignments. Requires super admin access.",
			},
		},
	)

	// PUT /users/:id - Update user
	.put(
		"/:id",
		async ({ params, body, set, user }) => {
			const result = await UsersService.update(params.id, body);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			// Audit log (exclude password from changes)
			const changes: Record<string, unknown> = {};
			if (body.name) changes.name = body.name;
			if (body.email) changes.email = body.email;
			if (body.password) changes.password = "[changed]";

			await AuditLogService.log({
				entityType: "user",
				entityId: params.id,
				action: "update",
				actorId: user.id,
				actorName: user.name,
				changes,
			});

			return {
				success: true,
				user: result.user,
			};
		},
		{
			isSuperAdmin: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			body: UsersModel.updateBody,
			response: {
				200: UsersModel.updateResponse,
				401: UsersModel.errorResponse,
				403: UsersModel.errorResponse,
				404: UsersModel.errorResponse,
				409: UsersModel.errorResponse,
			},
			detail: {
				summary: "Update user",
				description:
					"Update user name, email, or password. Requires super admin access.",
			},
		},
	)

	// DELETE /users/:id - Delete user
	.delete(
		"/:id",
		async ({ params, set, user }) => {
			// Get user info before deletion for log
			const userInfo = await UsersService.getById(params.id);
			const deletedUserName = userInfo.success
				? userInfo.user.name
				: `User #${params.id}`;

			const result = await UsersService.delete(params.id);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			// Audit log
			await AuditLogService.log({
				entityType: "user",
				entityId: params.id,
				action: "delete",
				actorId: user.id,
				actorName: user.name,
				changes: { deleted_user: deletedUserName },
			});

			return { success: true, message: "User deleted successfully" };
		},
		{
			isSuperAdmin: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			response: {
				200: UsersModel.deleteResponse,
				401: UsersModel.errorResponse,
				403: UsersModel.errorResponse,
				404: UsersModel.errorResponse,
			},
			detail: {
				summary: "Delete user",
				description:
					"Delete user and all their project assignments. Requires super admin access.",
			},
		},
	);

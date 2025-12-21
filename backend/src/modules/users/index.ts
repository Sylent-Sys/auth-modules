// Users Controller - HTTP routing for user management (Super Admin only)
import { Elysia, t } from "elysia";
import { authGuard } from "../../lib/middleware";
import { UsersService } from "./service";
import { UsersModel } from "./model";

export const usersController = new Elysia({
	prefix: "/users",
	tags: ["Users"],
})
	.use(authGuard)

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
		async ({ params, body, set }) => {
			const result = await UsersService.update(params.id, body);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

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
		async ({ params, set }) => {
			const result = await UsersService.delete(params.id);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

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

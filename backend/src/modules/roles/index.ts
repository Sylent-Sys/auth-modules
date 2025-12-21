// Roles Controller - HTTP routing for role management (Super Admin only)
import { Elysia, t } from "elysia";
import { authGuard } from "../../lib/middleware";
import { RolesService } from "./service";
import { RolesModel } from "./model";

export const rolesController = new Elysia({
	prefix: "/roles",
	tags: ["Roles"],
})
	.use(authGuard)

	// GET /roles - List all roles
	.get(
		"/",
		async () => {
			const roles = await RolesService.list();

			return {
				success: true,
				roles,
			};
		},
		{
			isSuperAdmin: true,
			response: {
				200: RolesModel.listResponse,
				401: RolesModel.errorResponse,
				403: RolesModel.errorResponse,
			},
			detail: {
				summary: "List all roles",
				description:
					"Get a list of all available roles. Requires super admin access.",
			},
		},
	)

	// POST /roles - Create a new role
	.post(
		"/",
		async ({ body, set }) => {
			const result = await RolesService.create(body.name, body.description);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			set.status = 201;
			return {
				success: true,
				role: result.role,
			};
		},
		{
			isSuperAdmin: true,
			body: RolesModel.createBody,
			response: {
				201: RolesModel.createResponse,
				401: RolesModel.errorResponse,
				403: RolesModel.errorResponse,
				409: RolesModel.errorResponse,
			},
			detail: {
				summary: "Create a new role",
				description: "Create a new role. Requires super admin access.",
			},
		},
	)

	// PUT /roles/:id - Update a role
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const result = await RolesService.update(params.id, body);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			return {
				success: true,
				role: result.role,
			};
		},
		{
			isSuperAdmin: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			body: RolesModel.updateBody,
			response: {
				200: RolesModel.updateResponse,
				401: RolesModel.errorResponse,
				403: RolesModel.errorResponse,
				404: RolesModel.errorResponse,
				409: RolesModel.errorResponse,
			},
			detail: {
				summary: "Update a role",
				description:
					"Update role name or description. Protected system roles cannot be modified. Requires super admin access.",
			},
		},
	)

	// DELETE /roles/:id - Delete a role
	.delete(
		"/:id",
		async ({ params, set }) => {
			const result = await RolesService.delete(params.id);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			return { success: true, message: "Role deleted successfully" };
		},
		{
			isSuperAdmin: true,
			params: t.Object({
				id: t.Numeric(),
			}),
			response: {
				200: RolesModel.deleteResponse,
				401: RolesModel.errorResponse,
				403: RolesModel.errorResponse,
				404: RolesModel.errorResponse,
				409: RolesModel.errorResponse,
			},
			detail: {
				summary: "Delete a role",
				description:
					"Delete a role. Protected system roles and roles in use cannot be deleted. Requires super admin access.",
			},
		},
	);

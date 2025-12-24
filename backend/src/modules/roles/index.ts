// Roles Controller - HTTP routing for role management (Super Admin only)
import { Elysia, t } from "elysia";
import { authGuard } from "../../lib/middleware";
import { AuditLogService } from "../../lib/audit-log";
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
		async ({ body, set, user }) => {
			const result = await RolesService.create(body.name, body.description);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			// Audit log
			await AuditLogService.log({
				entityType: "role",
				entityId: result.role.id,
				action: "create",
				actorId: user.id,
				actorName: user.name,
				changes: { name: body.name, description: body.description || null },
			});

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
		async ({ params, body, set, user }) => {
			const result = await RolesService.update(params.id, body);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			// Audit log
			const changes: Record<string, unknown> = {};
			if (body.name) changes.name = body.name;
			if (body.description !== undefined)
				changes.description = body.description;

			await AuditLogService.log({
				entityType: "role",
				entityId: params.id,
				action: "update",
				actorId: user.id,
				actorName: user.name,
				changes,
			});

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
		async ({ params, set, user }) => {
			// Get role info before deletion for log
			const roles = await RolesService.list();
			const targetRole = roles.find((r) => r.id === params.id);
			const deletedRoleName = targetRole?.name || `Role #${params.id}`;

			const result = await RolesService.delete(params.id);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			// Audit log
			await AuditLogService.log({
				entityType: "role",
				entityId: params.id,
				action: "delete",
				actorId: user.id,
				actorName: user.name,
				changes: { deleted_role: deletedRoleName },
			});

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

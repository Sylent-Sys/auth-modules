// Audit Logs Controller - HTTP routing for audit log viewing (Super Admin only)
import { Elysia } from "elysia";
import { authGuard } from "../../lib/middleware";
import { AuditLogService } from "../../lib/audit-log";
import { AuditLogsModel } from "./model";

export const auditLogsController = new Elysia({
	prefix: "/audit-logs",
	tags: ["Audit Logs"],
})
	.use(authGuard)

	// GET /audit-logs - List audit logs with optional filters
	.get(
		"/",
		async ({ query }) => {
			const result = await AuditLogService.list({
				entityType: query.entity_type,
				entityId: query.entity_id,
				actorId: query.actor_id,
				action: query.action,
				limit: query.limit,
				offset: query.offset,
			});

			return {
				success: true,
				logs: result.logs,
				total: result.total,
			};
		},
		{
			isSuperAdmin: true,
			query: AuditLogsModel.listQuery,
			response: {
				200: AuditLogsModel.listResponse,
				401: AuditLogsModel.errorResponse,
				403: AuditLogsModel.errorResponse,
			},
			detail: {
				summary: "List audit logs",
				description:
					"Get audit logs with optional filters. Requires super admin access.",
			},
		},
	);

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

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

// Audit Logs Model - DTO definitions for audit log endpoints
import { t } from "elysia";

export namespace AuditLogsModel {
	// GET /audit-logs - List logs
	export const listQuery = t.Object({
		entity_type: t.Optional(t.Union([t.Literal("user"), t.Literal("role")])),
		entity_id: t.Optional(t.Numeric()),
		actor_id: t.Optional(t.Numeric()),
		action: t.Optional(
			t.Union([t.Literal("create"), t.Literal("update"), t.Literal("delete")]),
		),
		limit: t.Optional(t.Numeric()),
		offset: t.Optional(t.Numeric()),
	});

	export const listResponse = t.Object({
		success: t.Boolean(),
		logs: t.Array(
			t.Object({
				id: t.Number(),
				entity_type: t.Union([t.Literal("user"), t.Literal("role")]),
				entity_id: t.Number(),
				action: t.Union([
					t.Literal("create"),
					t.Literal("update"),
					t.Literal("delete"),
				]),
				actor_id: t.Number(),
				actor_name: t.String(),
				changes: t.Nullable(t.Record(t.String(), t.Unknown())),
				created_at: t.String(),
			}),
		),
		total: t.Number(),
	});

	// Error response
	export const errorResponse = t.Object({
		success: t.Boolean(),
		error: t.String(),
	});
}

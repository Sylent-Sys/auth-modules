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

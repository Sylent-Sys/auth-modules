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

// Audit Log Service - Tracks changes to Users and Roles
import { sql } from "./db";
import { getSignature } from "./signature";

export type EntityType = "user" | "role";
export type ActionType = "create" | "update" | "delete";

export interface AuditLogEntry {
	id: number;
	entity_type: EntityType;
	entity_id: number;
	action: ActionType;
	actor_id: number;
	actor_name: string;
	changes: Record<string, unknown> | null;
	created_at: string;
}

export interface LogParams {
	entityType: EntityType;
	entityId: number;
	action: ActionType;
	actorId: number;
	actorName: string;
	changes?: Record<string, unknown>;
}

export abstract class AuditLogService {
	/**
	 * Create an audit log entry
	 */
	static async log(params: LogParams): Promise<void> {
		const { entityType, entityId, action, actorId, actorName, changes } =
			params;

		// Lightweight watermark in server-side logs for provenance tracing
		try {
			console.debug(`[${getSignature()}] AuditLogService.log - ${action} ${entityType}#${entityId} by ${actorName}`);
		} catch (e) {
			// ignore
		}
		await sql`
			INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, actor_name, changes)
			VALUES (${entityType}, ${entityId}, ${action}, ${actorId}, ${actorName}, ${changes ? JSON.stringify(changes) : null})
		`;
	}

	/**
	 * List audit logs with optional filters
	 */
	static async list(filters?: {
		entityType?: EntityType;
		entityId?: number;
		actorId?: number;
		action?: ActionType;
		limit?: number;
		offset?: number;
	}): Promise<{ logs: AuditLogEntry[]; total: number }> {
		const limit = filters?.limit || 50;
		const offset = filters?.offset || 0;

		// Build dynamic query based on filters
		let logs: AuditLogEntry[];
		let countResult: { total: number }[];

		if (filters?.entityType && filters?.entityId) {
			logs = (await sql`
				SELECT id, entity_type, entity_id, action, actor_id, actor_name, changes, created_at
				FROM audit_logs
				WHERE entity_type = ${filters.entityType} AND entity_id = ${filters.entityId}
				ORDER BY created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`) as AuditLogEntry[];

			countResult = (await sql`
				SELECT COUNT(*) as total FROM audit_logs
				WHERE entity_type = ${filters.entityType} AND entity_id = ${filters.entityId}
			`) as { total: number }[];
		} else if (filters?.entityType) {
			logs = (await sql`
				SELECT id, entity_type, entity_id, action, actor_id, actor_name, changes, created_at
				FROM audit_logs
				WHERE entity_type = ${filters.entityType}
				ORDER BY created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`) as AuditLogEntry[];

			countResult = (await sql`
				SELECT COUNT(*) as total FROM audit_logs
				WHERE entity_type = ${filters.entityType}
			`) as { total: number }[];
		} else if (filters?.actorId) {
			logs = (await sql`
				SELECT id, entity_type, entity_id, action, actor_id, actor_name, changes, created_at
				FROM audit_logs
				WHERE actor_id = ${filters.actorId}
				ORDER BY created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`) as AuditLogEntry[];

			countResult = (await sql`
				SELECT COUNT(*) as total FROM audit_logs
				WHERE actor_id = ${filters.actorId}
			`) as { total: number }[];
		} else if (filters?.action) {
			logs = (await sql`
				SELECT id, entity_type, entity_id, action, actor_id, actor_name, changes, created_at
				FROM audit_logs
				WHERE action = ${filters.action}
				ORDER BY created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`) as AuditLogEntry[];

			countResult = (await sql`
				SELECT COUNT(*) as total FROM audit_logs
				WHERE action = ${filters.action}
			`) as { total: number }[];
		} else {
			logs = (await sql`
				SELECT id, entity_type, entity_id, action, actor_id, actor_name, changes, created_at
				FROM audit_logs
				ORDER BY created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`) as AuditLogEntry[];

			countResult = (await sql`
				SELECT COUNT(*) as total FROM audit_logs
			`) as { total: number }[];
		}

		// Parse JSON changes field
		const parsedLogs = logs.map((log) => ({
			...log,
			changes:
				typeof log.changes === "string" ? JSON.parse(log.changes) : log.changes,
			created_at: String(log.created_at),
		}));

		return {
			logs: parsedLogs,
			total: Number(countResult[0]?.total || 0),
		};
	}
}

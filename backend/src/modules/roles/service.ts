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

// Roles Service - Business logic for role management
import { sql } from "../../lib/db";

interface RoleRow {
	id: number;
	name: string;
	description: string | null;
}

// Protected role names that cannot be modified or deleted
const PROTECTED_ROLES = ["super_admin", "admin", "member"];

export abstract class RolesService {
	/**
	 * List all roles
	 */
	static async list(): Promise<RoleRow[]> {
		const roles = await sql`
			SELECT id, name, description
			FROM roles
			ORDER BY id ASC
		`;
		return roles as RoleRow[];
	}

	/**
	 * Create a new role
	 */
	static async create(
		name: string,
		description?: string,
	): Promise<
		| { success: true; role: RoleRow }
		| { success: false; error: string; status: number }
	> {
		// Check if role name exists
		const existing = await sql`
			SELECT id FROM roles WHERE name = ${name} LIMIT 1
		`;

		if (existing.length > 0) {
			return { success: false, error: "Role name already exists", status: 409 };
		}

		// Insert role
		await sql`
			INSERT INTO roles (name, description)
			VALUES (${name}, ${description || null})
		`;

		// Fetch created role
		const roles = await sql`
			SELECT id, name, description
			FROM roles
			WHERE name = ${name}
			LIMIT 1
		`;

		return {
			success: true,
			role: roles[0] as RoleRow,
		};
	}

	/**
	 * Update a role
	 */
	static async update(
		id: number,
		data: { name?: string; description?: string },
	): Promise<
		| { success: true; role: RoleRow }
		| { success: false; error: string; status: number }
	> {
		// Check if role exists
		const existing = await sql`
			SELECT id, name, description FROM roles WHERE id = ${id} LIMIT 1
		`;

		if (existing.length === 0) {
			return { success: false, error: "Role not found", status: 404 };
		}

		const role = existing[0] as RoleRow;

		// Prevent modifying protected roles
		if (PROTECTED_ROLES.includes(role.name)) {
			return {
				success: false,
				error: "Cannot modify protected system role",
				status: 403,
			};
		}

		// Check name uniqueness if changing name
		if (data.name && data.name !== role.name) {
			const nameCheck = await sql`
				SELECT id FROM roles WHERE name = ${data.name} AND id != ${id} LIMIT 1
			`;
			if (nameCheck.length > 0) {
				return {
					success: false,
					error: "Role name already exists",
					status: 409,
				};
			}
		}

		// Update role
		const newName = data.name || role.name;
		const newDescription =
			data.description !== undefined ? data.description : role.description;

		await sql`
			UPDATE roles
			SET name = ${newName}, description = ${newDescription}
			WHERE id = ${id}
		`;

		return {
			success: true,
			role: { id, name: newName, description: newDescription },
		};
	}

	/**
	 * Delete a role
	 */
	static async delete(
		id: number,
	): Promise<
		{ success: true } | { success: false; error: string; status: number }
	> {
		// Check if role exists
		const existing = await sql`
			SELECT id, name FROM roles WHERE id = ${id} LIMIT 1
		`;

		if (existing.length === 0) {
			return { success: false, error: "Role not found", status: 404 };
		}

		const role = existing[0] as { id: number; name: string };

		// Prevent deleting protected roles
		if (PROTECTED_ROLES.includes(role.name)) {
			return {
				success: false,
				error: "Cannot delete protected system role",
				status: 403,
			};
		}

		// Check if role is in use
		const assignmentCheck = await sql`
			SELECT id FROM project_assignments WHERE role_id = ${id} LIMIT 1
		`;

		if (assignmentCheck.length > 0) {
			return {
				success: false,
				error: "Cannot delete role that is currently assigned to users",
				status: 409,
			};
		}

		// Delete role
		await sql`DELETE FROM roles WHERE id = ${id}`;

		return { success: true };
	}
}

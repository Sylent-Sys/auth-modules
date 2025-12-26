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

// Assignments Service - Business logic for project assignments
import { sql } from "../../lib/db";

interface AssignmentRow {
	id: number;
	user_id: number;
	user_name: string;
	user_email: string;
	project_id: number;
	project_name: string;
	project_key: string;
	role_id: number;
	role_name: string;
	created_at: string;
}

interface RoleRow {
	id: number;
	name: string;
	description: string | null;
}

export abstract class AssignmentService {
	/**
	 * Assign a user to a project with a specific role
	 */
	static async create(
		userId: number,
		projectId: number,
		roleId: number,
	): Promise<
		| { success: true; assignment: AssignmentRow }
		| { success: false; error: string; status: number }
	> {
		// Validate user exists
		const users = await sql`
      SELECT id, name FROM users WHERE id = ${userId} LIMIT 1
    `;
		if (users.length === 0) {
			return { success: false, error: "User not found", status: 404 };
		}

		// Validate project exists
		const projects = await sql`
      SELECT id, name, project_key FROM projects WHERE id = ${projectId} LIMIT 1
    `;
		if (projects.length === 0) {
			return { success: false, error: "Project not found", status: 404 };
		}

		// Validate role exists
		const roles = await sql`
      SELECT id, name FROM roles WHERE id = ${roleId} LIMIT 1
    `;
		if (roles.length === 0) {
			return { success: false, error: "Role not found", status: 404 };
		}

		// Check if assignment already exists
		const existing = await sql`
      SELECT id FROM project_assignments 
      WHERE user_id = ${userId} AND project_id = ${projectId}
      LIMIT 1
    `;

		if (existing.length > 0) {
			// Update existing assignment
			await sql`
        UPDATE project_assignments 
        SET role_id = ${roleId}
        WHERE user_id = ${userId} AND project_id = ${projectId}
      `;
		} else {
			// Create new assignment
			await sql`
        INSERT INTO project_assignments (user_id, project_id, role_id)
        VALUES (${userId}, ${projectId}, ${roleId})
      `;
		}

		// Fetch the created/updated assignment
		const assignments = await sql`
      SELECT 
        pa.id,
        pa.user_id,
        u.name as user_name,
        u.email as user_email,
        pa.project_id,
        p.name as project_name,
        p.project_key,
        pa.role_id,
        r.name as role_name,
        pa.created_at
      FROM project_assignments pa
      JOIN users u ON u.id = pa.user_id
      JOIN projects p ON p.id = pa.project_id
      JOIN roles r ON r.id = pa.role_id
      WHERE pa.user_id = ${userId} AND pa.project_id = ${projectId}
      LIMIT 1
    `;

		const assignment = assignments[0] as AssignmentRow;

		return {
			success: true,
			assignment,
		};
	}

	/**
	 * List all assignments (optionally filtered by project)
	 */
	static async list(projectId?: number): Promise<AssignmentRow[]> {
		if (projectId) {
			const assignments = await sql`
        SELECT 
          pa.id,
          pa.user_id,
          u.name as user_name,
          u.email as user_email,
          pa.project_id,
          p.name as project_name,
          p.project_key,
          pa.role_id,
          r.name as role_name,
          pa.created_at
        FROM project_assignments pa
        JOIN users u ON u.id = pa.user_id
        JOIN projects p ON p.id = pa.project_id
        JOIN roles r ON r.id = pa.role_id
        WHERE pa.project_id = ${projectId}
        ORDER BY pa.created_at DESC
      `;
			return assignments as AssignmentRow[];
		}

		const assignments = await sql`
      SELECT 
        pa.id,
        pa.user_id,
        u.name as user_name,
        u.email as user_email,
        pa.project_id,
        p.name as project_name,
        p.project_key,
        pa.role_id,
        r.name as role_name,
        pa.created_at
      FROM project_assignments pa
      JOIN users u ON u.id = pa.user_id
      JOIN projects p ON p.id = pa.project_id
      JOIN roles r ON r.id = pa.role_id
      ORDER BY pa.created_at DESC
    `;

		return assignments as AssignmentRow[];
	}

	/**
	 * Delete an assignment
	 */
	static async delete(
		userId: number,
		projectId: number,
	): Promise<
		{ success: true } | { success: false; error: string; status: number }
	> {
		const result = await sql`
      DELETE FROM project_assignments 
      WHERE user_id = ${userId} AND project_id = ${projectId}
    `;

		// Check if anything was deleted
		const deleteResult = result as { affectedRows?: number; changes?: number };
		const affected = deleteResult.affectedRows ?? deleteResult.changes ?? 0;

		if (affected === 0) {
			return { success: false, error: "Assignment not found", status: 404 };
		}

		return { success: true };
	}

	/**
	 * List all roles
	 */
	static async listRoles(): Promise<RoleRow[]> {
		const roles = await sql`
      SELECT id, name, description FROM roles ORDER BY id ASC
    `;
		return roles as RoleRow[];
	}
}

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

// Projects Service - Business logic for project management
import { sql } from "../../lib/db";
import { refreshOriginsCache } from "../../lib/cors";
import * as crypto from "node:crypto";

interface ProjectRow {
	id: number;
	name: string;
	project_key: string;
	base_url: string | null;
	created_at: string;
}

export abstract class ProjectService {
	/**
	 * Generate a unique project key
	 */
	private static generateProjectKey(name: string): string {
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "_")
			.replace(/^_|_$/g, "");
		const random = crypto.randomBytes(4).toString("hex");
		return `${slug}_${random}`;
	}

	/**
	 * Create a new project
	 */
	static async create(
		name: string,
		baseUrl?: string,
	): Promise<
		| { success: true; project: ProjectRow }
		| { success: false; error: string; status: number }
	> {
		const projectKey = ProjectService.generateProjectKey(name);

		try {
			await sql`
        INSERT INTO projects (name, project_key, base_url)
        VALUES (${name}, ${projectKey}, ${baseUrl || null})
      `;

			// Refresh CORS cache karena ada project baru
			await refreshOriginsCache();

			// Fetch the created project
			const projects = await sql`
        SELECT id, name, project_key, base_url, created_at
        FROM projects
        WHERE project_key = ${projectKey}
        LIMIT 1
      `;

			if (projects.length === 0) {
				return {
					success: false,
					error: "Failed to create project",
					status: 500,
				};
			}

			const project = projects[0] as ProjectRow;

			return {
				success: true,
				project: {
					id: project.id,
					name: project.name,
					project_key: project.project_key,
					base_url: project.base_url,
					created_at: project.created_at,
				},
			};
		} catch (error: unknown) {
			const err = error as { code?: string };
			if (err.code === "ER_DUP_ENTRY") {
				return {
					success: false,
					error: "Project name already exists",
					status: 409,
				};
			}
			throw error;
		}
	}

	/**
	 * List all projects
	 */
	static async list(): Promise<ProjectRow[]> {
		const projects = await sql`
      SELECT id, name, project_key, base_url, created_at
      FROM projects
      ORDER BY created_at DESC
    `;

		return projects as ProjectRow[];
	}

	/**
	 * Get project by key
	 */
	static async getByKey(projectKey: string): Promise<ProjectRow | null> {
		const projects = await sql`
      SELECT id, name, project_key, base_url, created_at
      FROM projects
      WHERE project_key = ${projectKey}
      LIMIT 1
    `;

		if (projects.length === 0) {
			return null;
		}

		return projects[0] as ProjectRow;
	}

	/**
	 * Get project by ID
	 */
	static async getById(id: number): Promise<ProjectRow | null> {
		const projects = await sql`
      SELECT id, name, project_key, base_url, created_at
      FROM projects
      WHERE id = ${id}
      LIMIT 1
    `;

		if (projects.length === 0) {
			return null;
		}

		return projects[0] as ProjectRow;
	}

	/**
	 * Update a project
	 */
	static async update(
		id: number,
		data: { name?: string; base_url?: string | null },
	): Promise<
		| { success: true; project: ProjectRow }
		| { success: false; error: string; status: number }
	> {
		const existing = await ProjectService.getById(id);
		if (!existing) {
			return { success: false, error: "Project not found", status: 404 };
		}

		const newName = data.name ?? existing.name;
		const newBaseUrl =
			data.base_url !== undefined ? data.base_url : existing.base_url;

		try {
			await sql`
        UPDATE projects
        SET name = ${newName}, base_url = ${newBaseUrl}
        WHERE id = ${id}
      `;

			// Refresh CORS cache if base_url changed
			if (data.base_url !== undefined) {
				await refreshOriginsCache();
			}

			const updated = await ProjectService.getById(id);
			return { success: true, project: updated as ProjectRow };
		} catch (error: unknown) {
			const err = error as { code?: string };
			if (err.code === "ER_DUP_ENTRY") {
				return {
					success: false,
					error: "Project name already exists",
					status: 409,
				};
			}
			throw error;
		}
	}

	/**
	 * Delete a project
	 */
	static async delete(
		id: number,
	): Promise<
		{ success: true } | { success: false; error: string; status: number }
	> {
		const existing = await ProjectService.getById(id);
		if (!existing) {
			return { success: false, error: "Project not found", status: 404 };
		}

		// Check if project has assignments
		const assignments = await sql`
      SELECT id FROM project_assignments WHERE project_id = ${id} LIMIT 1
    `;

		if (assignments.length > 0) {
			return {
				success: false,
				error:
					"Cannot delete project with active assignments. Remove all assignments first.",
				status: 409,
			};
		}

		await sql`DELETE FROM projects WHERE id = ${id}`;

		// Refresh CORS cache
		await refreshOriginsCache();

		return { success: true };
	}
}

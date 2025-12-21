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
}

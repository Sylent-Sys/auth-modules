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

// Auth Service - Business logic for authentication
import { sql } from "../../lib/db";
import { hashPassword, verifyPassword } from "../../lib/password";
import { signJWT } from "../../lib/jwt";
import { JWT_PRIVATE_KEY, JWT_ISSUER, JWT_EXPIRES_IN } from "../../env";

interface UserRow {
	id: number;
	name: string;
	email: string;
	password: string;
}

interface ProjectRow {
	id: number;
	name: string;
	project_key: string;
}

interface AssignmentRow {
	user_id: number;
	project_id: number;
	role_id: number;
	role_name: string;
}

export abstract class AuthService {
	/**
	 * Login user to a specific project
	 * Returns JWT token scoped to that project
	 */
	static async login(
		email: string,
		password: string,
		projectKey: string,
	): Promise<
		| {
				success: true;
				token: string;
				user: {
					id: number;
					name: string;
					email: string;
					role: string;
					project_id: number;
					project_key: string;
				};
		  }
		| { success: false; error: string; status: number }
	> {
		// Step 1: Validate user
		const users = await sql`
      SELECT id, name, email, password 
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `;

		if (users.length === 0) {
			return {
				success: false,
				error: "Invalid email or password",
				status: 401,
			};
		}

		const user = users[0] as UserRow;
		const passwordValid = await verifyPassword(password, user.password);

		if (!passwordValid) {
			return {
				success: false,
				error: "Invalid email or password",
				status: 401,
			};
		}

		// Step 2: Identify project
		const projects = await sql`
      SELECT id, name, project_key 
      FROM projects 
      WHERE project_key = ${projectKey} 
      LIMIT 1
    `;

		if (projects.length === 0) {
			return { success: false, error: "Invalid project key", status: 400 };
		}

		const project = projects[0] as ProjectRow;

		// Step 3: Check authorization (project assignment)
		const assignments = await sql`
      SELECT pa.user_id, pa.project_id, pa.role_id, r.name as role_name
      FROM project_assignments pa
      JOIN roles r ON r.id = pa.role_id
      WHERE pa.user_id = ${user.id} AND pa.project_id = ${project.id}
      LIMIT 1
    `;

		if (assignments.length === 0) {
			return {
				success: false,
				error: "User is not assigned to this project",
				status: 403,
			};
		}

		const assignment = assignments[0] as AssignmentRow;

		// Step 4: Generate JWT
		if (!JWT_PRIVATE_KEY) {
			return {
				success: false,
				error: "JWT private key not configured",
				status: 500,
			};
		}

		const token = await signJWT(
			{
				iss: JWT_ISSUER,
				sub: String(user.id),
				aud: projectKey,
				data: {
					email: user.email,
					name: user.name,
					role: assignment.role_name,
				},
			},
			JWT_PRIVATE_KEY,
			JWT_EXPIRES_IN,
		);

		return {
			success: true,
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: assignment.role_name,
				project_id: project.id,
				project_key: project.project_key,
			},
		};
	}

	/**
	 * Register new user and assign to project with default 'member' role
	 */
	static async register(
		name: string,
		email: string,
		password: string,
		projectKey: string,
	): Promise<
		| {
				success: true;
				message: string;
				user: { id: number; name: string; email: string };
		  }
		| { success: false; error: string; status: number }
	> {
		// Check if project exists
		const projects = await sql`
      SELECT id FROM projects WHERE project_key = ${projectKey} LIMIT 1
    `;

		if (projects.length === 0) {
			return { success: false, error: "Invalid project key", status: 400 };
		}

		const project = projects[0] as { id: number };

		// Check if user already exists
		const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

		let userId: number;

		if (existingUsers.length > 0) {
			// User exists, check if already assigned to this project
			userId = (existingUsers[0] as { id: number }).id;

			const existingAssignment = await sql`
        SELECT id FROM project_assignments 
        WHERE user_id = ${userId} AND project_id = ${project.id} 
        LIMIT 1
      `;

			if (existingAssignment.length > 0) {
				return {
					success: false,
					error: "User is already registered for this project",
					status: 409,
				};
			}
		} else {
			// Create new user
			const hashedPassword = await hashPassword(password);

			const result = await sql`
        INSERT INTO users (name, email, password) 
        VALUES (${name}, ${email}, ${hashedPassword})
      `;

			const insertResult = result as {
				insertId?: number;
				lastInsertRowid?: number;
			};
			userId = insertResult.insertId || insertResult.lastInsertRowid || 0;

			// If insertId not available, fetch the user
			if (!userId) {
				const newUser =
					await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
				userId = (newUser[0] as { id: number }).id;
			}
		}

		// Get default 'member' role
		const roles = await sql`
      SELECT id FROM roles WHERE name = 'member' LIMIT 1
    `;

		if (roles.length === 0) {
			return { success: false, error: "Default role not found", status: 500 };
		}

		const roleId = (roles[0] as { id: number }).id;

		// Assign user to project
		await sql`
      INSERT INTO project_assignments (user_id, project_id, role_id)
      VALUES (${userId}, ${project.id}, ${roleId})
    `;

		// Fetch user details
		const users = await sql`
      SELECT id, name, email FROM users WHERE id = ${userId} LIMIT 1
    `;
		const user = users[0] as { id: number; name: string; email: string };

		return {
			success: true,
			message: "User registered successfully",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		};
	}

	/**
	 * Get public key for JWT verification
	 */
	static getPublicKey(): string {
		// Return public key from validated environment module
		const { JWT_PUBLIC_KEY } = require("../../env");
		if (!JWT_PUBLIC_KEY) throw new Error("JWT public key not configured");
		return JWT_PUBLIC_KEY;
	}
}

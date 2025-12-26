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

// Users Service - Business logic for user management
import { sql } from "../../lib/db";
import { hashPassword } from "../../lib/password";

interface UserRow {
	id: number;
	name: string;
	email: string;
	created_at: string;
}

interface UserAssignment {
	project_id: number;
	project_name: string;
	project_key: string;
	role_id: number;
	role_name: string;
}

export abstract class UsersService {
	/**
	 * List all users
	 */
	static async list(): Promise<UserRow[]> {
		const users = await sql`
			SELECT id, name, email, created_at
			FROM users
			ORDER BY id ASC
		`;
		return users as UserRow[];
	}

	/**
	 * Create a new user (admin-side)
	 */
	static async create(
		name: string,
		email: string,
		password: string,
	): Promise<
		| { success: true; user: UserRow }
		| { success: false; error: string; status: number }
	> {
		// Check if email already exists
		const existing = await sql`
			SELECT id FROM users WHERE email = ${email} LIMIT 1
		`;

		if (existing.length > 0) {
			return { success: false, error: "Email already in use", status: 409 };
		}

		const hashedPassword = await hashPassword(password);

		await sql`
			INSERT INTO users (name, email, password)
			VALUES (${name}, ${email}, ${hashedPassword})
		`;

		// Fetch created user
		const users = await sql`
			SELECT id, name, email, created_at
			FROM users
			WHERE email = ${email}
			LIMIT 1
		`;

		return {
			success: true,
			user: users[0] as UserRow,
		};
	}

	/**
	 * Get user by ID with assignments
	 */
	static async getById(
		id: number,
	): Promise<
		| { success: true; user: UserRow & { assignments: UserAssignment[] } }
		| { success: false; error: string; status: number }
	> {
		const users = await sql`
			SELECT id, name, email, created_at
			FROM users
			WHERE id = ${id}
			LIMIT 1
		`;

		if (users.length === 0) {
			return { success: false, error: "User not found", status: 404 };
		}

		const user = users[0] as UserRow;

		// Get user assignments
		const assignments = await sql`
			SELECT 
				p.id as project_id,
				p.name as project_name,
				p.project_key,
				r.id as role_id,
				r.name as role_name
			FROM project_assignments pa
			JOIN projects p ON p.id = pa.project_id
			JOIN roles r ON r.id = pa.role_id
			WHERE pa.user_id = ${id}
			ORDER BY p.name ASC
		`;

		return {
			success: true,
			user: {
				...user,
				assignments: assignments as UserAssignment[],
			},
		};
	}

	/**
	 * Update user
	 */
	static async update(
		id: number,
		data: { name?: string; email?: string; password?: string },
	): Promise<
		| { success: true; user: { id: number; name: string; email: string } }
		| { success: false; error: string; status: number }
	> {
		// Check if user exists
		const existing = await sql`
			SELECT id, name, email FROM users WHERE id = ${id} LIMIT 1
		`;

		if (existing.length === 0) {
			return { success: false, error: "User not found", status: 404 };
		}

		const user = existing[0] as { id: number; name: string; email: string };

		// Check email uniqueness if changing email
		if (data.email && data.email !== user.email) {
			const emailCheck = await sql`
				SELECT id FROM users WHERE email = ${data.email} AND id != ${id} LIMIT 1
			`;
			if (emailCheck.length > 0) {
				return { success: false, error: "Email already in use", status: 409 };
			}
		}

		// Build update
		const newName = data.name || user.name;
		const newEmail = data.email || user.email;

		if (data.password) {
			const hashedPassword = await hashPassword(data.password);
			await sql`
				UPDATE users
				SET name = ${newName}, email = ${newEmail}, password = ${hashedPassword}
				WHERE id = ${id}
			`;
		} else {
			await sql`
				UPDATE users
				SET name = ${newName}, email = ${newEmail}
				WHERE id = ${id}
			`;
		}

		return {
			success: true,
			user: { id, name: newName, email: newEmail },
		};
	}

	/**
	 * Delete user
	 */
	static async delete(
		id: number,
	): Promise<
		{ success: true } | { success: false; error: string; status: number }
	> {
		// Check if user exists
		const existing = await sql`
			SELECT id FROM users WHERE id = ${id} LIMIT 1
		`;

		if (existing.length === 0) {
			return { success: false, error: "User not found", status: 404 };
		}

		// Delete assignments first (foreign key)
		await sql`DELETE FROM project_assignments WHERE user_id = ${id}`;

		// Delete user
		await sql`DELETE FROM users WHERE id = ${id}`;

		return { success: true };
	}
}

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

// Auth Middleware - JWT verification guard for protected routes
import { Elysia } from "elysia";
import { verifyJWT } from "./jwt";
import { JWT_PUBLIC_KEY } from "../env";

export interface AuthUser {
	id: number;
	email: string;
	name: string;
	role: string;
	projectKey: string;
}

/**
 * Auth guard middleware for protected routes
 * Verifies JWT token and extracts user info
 *
 * For admin-only endpoints, use this with additional role check
 */
export const authGuard = new Elysia({ name: "Auth.Guard" })
	.derive({ as: "scoped" }, async ({ request, set }) => {
		const authHeader = request.headers.get("Authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			set.status = 401;
			return {
				user: null as AuthUser | null,
				authError: "Missing or invalid authorization header",
			};
		}

		const token = authHeader.substring(7);

		if (!JWT_PUBLIC_KEY) {
			set.status = 500;
			return {
				user: null as AuthUser | null,
				authError: "JWT public key not configured",
			};
		}

		const result = await verifyJWT(token, JWT_PUBLIC_KEY);

		if (!result.valid || !result.payload) {
			set.status = 401;
			return {
				user: null as AuthUser | null,
				authError: result.error || "Invalid token",
			};
		}
		const payload = result.payload;
		const user: AuthUser = {
			id: parseInt(payload.sub, 10),
			email: payload.data.email,
			name: payload.data.name,
			role: payload.data.role,
			projectKey: payload.aud,
		};

		return { user, authError: null };
	})
	.macro({
		isAuth: {
			resolve({ user, authError, set }) {
				if (!user || authError) {
					set.status = 401;
					throw new Error(authError || "Unauthorized");
				}
				return { user };
			},
		},
		isAdmin: {
			resolve({ user, authError, set }) {
				if (!user || authError) {
					set.status = 401;
					throw new Error(authError || "Unauthorized");
				}
				if (user.role !== "admin" && user.role !== "super_admin") {
					set.status = 403;
					throw new Error("Admin access required");
				}
				return { user };
			},
		},
		isSuperAdmin: {
			resolve({ user, authError, set }) {
				if (!user || authError) {
					set.status = 401;
					throw new Error(authError || "Unauthorized");
				}
				if (user.role !== "super_admin") {
					set.status = 403;
					throw new Error("Super admin access required");
				}
				return { user };
			},
		},
	});

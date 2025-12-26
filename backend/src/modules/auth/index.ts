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

// Auth Controller - HTTP routing for authentication endpoints
import { Elysia } from "elysia";
import { AuthService } from "./service";
import { AuthModel } from "./model";

export const authController = new Elysia({ prefix: "/auth", tags: ["Auth"] })
	// POST /auth/login
	.post(
		"/login",
		async ({ body, set }) => {
			const result = await AuthService.login(
				body.email,
				body.password,
				body.project_key,
			);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			return {
				success: true,
				token: result.token,
				user: result.user,
			};
		},
		{
			body: AuthModel.loginBody,
			response: {
				200: AuthModel.loginResponse,
				400: AuthModel.errorResponse,
				401: AuthModel.errorResponse,
				403: AuthModel.errorResponse,
			},
			detail: {
				summary: "Login to a project",
				description:
					"Authenticate user and get a project-scoped JWT token. The token is only valid for the specified project.",
			},
		},
	)

	// POST /auth/register
	.post(
		"/register",
		async ({ body, set }) => {
			const result = await AuthService.register(
				body.name,
				body.email,
				body.password,
				body.project_key,
			);

			if (!result.success) {
				set.status = result.status;
				return { success: false, error: result.error };
			}

			set.status = 201;
			return {
				success: true,
				message: result.message,
				user: result.user,
			};
		},
		{
			body: AuthModel.registerBody,
			response: {
				201: AuthModel.registerResponse,
				400: AuthModel.errorResponse,
				409: AuthModel.errorResponse,
			},
			detail: {
				summary: "Register a new user",
				description:
					"Register a new user and assign them to the specified project with 'member' role.",
			},
		},
	)

	// GET /auth/public-key
	.get(
		"/public-key",
		({ set }) => {
			try {
				const publicKey = AuthService.getPublicKey();
				return { publicKey };
			} catch (_error) {
				set.status = 500;
				return { success: false, error: "Public key not available" };
			}
		},
		{
			response: {
				200: AuthModel.publicKeyResponse,
				500: AuthModel.errorResponse,
			},
			detail: {
				summary: "Get JWT public key",
				description:
					"Get the public key (PEM format) for verifying JWT tokens issued by this auth service.",
			},
		},
	);

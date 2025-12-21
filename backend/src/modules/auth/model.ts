// Auth Model - DTO definitions for auth endpoints
import { t } from "elysia";

export namespace AuthModel {
	// POST /auth/login
	export const loginBody = t.Object({
		email: t.String({ format: "email" }),
		password: t.String({ minLength: 6 }),
		project_key: t.String({ minLength: 1 }),
	});
	export type LoginBody = typeof loginBody.static;

	export const loginResponse = t.Object({
		success: t.Boolean(),
		token: t.String(),
		user: t.Object({
			id: t.Number(),
			name: t.String(),
			email: t.String(),
			role: t.String(),
			project_id: t.Number(),
			project_key: t.String(),
		}),
	});
	export type LoginResponse = typeof loginResponse.static;

	// POST /auth/register
	export const registerBody = t.Object({
		name: t.String({ minLength: 1 }),
		email: t.String({ format: "email" }),
		password: t.String({ minLength: 6 }),
		project_key: t.String({ minLength: 1 }),
	});
	export type RegisterBody = typeof registerBody.static;

	export const registerResponse = t.Object({
		success: t.Boolean(),
		message: t.String(),
		user: t.Object({
			id: t.Number(),
			name: t.String(),
			email: t.String(),
		}),
	});
	export type RegisterResponse = typeof registerResponse.static;

	// GET /auth/public-key
	export const publicKeyResponse = t.Object({
		publicKey: t.String(),
	});
	export type PublicKeyResponse = typeof publicKeyResponse.static;

	// Error responses
	export const errorResponse = t.Object({
		success: t.Boolean(),
		error: t.String(),
	});
	export type ErrorResponse = typeof errorResponse.static;
}

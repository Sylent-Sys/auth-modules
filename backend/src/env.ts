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

import { z } from "zod/v4";

const envSchema = z.object({
	JWT_PRIVATE_KEY: z.string().min(1),
	JWT_PUBLIC_KEY: z.string().min(1),
	JWT_ISSUER: z.string().optional(),
	JWT_EXPIRES_IN: z.string().optional(),
	CORS_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
	throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const JWT_PRIVATE_KEY = parsed.data.JWT_PRIVATE_KEY.replace(
	/\\n/g,
	"\n",
);
export const JWT_PUBLIC_KEY = parsed.data.JWT_PUBLIC_KEY.replace(/\\n/g, "\n");
export const JWT_ISSUER = parsed.data.JWT_ISSUER || "https://auth-modules.com";
export const JWT_EXPIRES_IN = parseInt(
	parsed.data.JWT_EXPIRES_IN || "3600",
	10,
);
export const CORS_ORIGINS = parsed.data.CORS_ORIGINS || "";

export default {
	JWT_PRIVATE_KEY,
	JWT_PUBLIC_KEY,
	JWT_ISSUER,
	JWT_EXPIRES_IN,
	CORS_ORIGINS,
};

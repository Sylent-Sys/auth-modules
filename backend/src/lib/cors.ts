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

// CORS utilities - Dynamic origin validation from projects table
import { sql } from "./db";

interface ProjectOrigin {
	base_url: string | null;
}

// Cache untuk origins
let cachedOrigins: Set<string> = new Set();

/**
 * Fetch allowed origins dari tabel projects (internal)
 */
async function fetchOriginsFromDB(): Promise<Set<string>> {
	try {
		const projects = await sql`
			SELECT base_url FROM projects WHERE base_url IS NOT NULL AND base_url != ''
		`;

		const origins = new Set<string>();

		// Tambahkan origins dari env (fallback/additional)
		const envOrigins = process.env.CORS_ORIGINS?.split(",") || [];
		for (const origin of envOrigins) {
			const trimmed = origin.trim();
			if (trimmed && trimmed !== "*") {
				origins.add(trimmed);
			}
		}

		// Tambahkan origins dari database
		for (const project of projects as ProjectOrigin[]) {
			if (project.base_url) {
				// Normalize URL (remove trailing slash)
				const normalized = project.base_url.replace(/\/$/, "");
				origins.add(normalized);
			}
		}

		return origins;
	} catch (error) {
		console.error("Failed to fetch CORS origins from database:", error);
		return cachedOrigins;
	}
}

/**
 * Initialize CORS origins - dipanggil saat startup
 */
export async function initCorsOrigins(): Promise<void> {
	cachedOrigins = await fetchOriginsFromDB();
	console.log(`🌐 CORS origins loaded: ${cachedOrigins.size} origin(s)`);

	// Refresh setiap 1 menit
	setInterval(async () => {
		cachedOrigins = await fetchOriginsFromDB();
	}, 60 * 1000);
}

/**
 * Get cached origins sebagai array untuk CORS config
 */
export function getCorsOrigins(): string[] {
	if (process.env.CORS_ORIGINS === "*") {
		return ["*"];
	}
	return Array.from(cachedOrigins);
}

/**
 * Validate apakah origin diizinkan (sync)
 */
export function isOriginAllowed(origin: string): boolean {
	if (process.env.CORS_ORIGINS === "*") {
		return true;
	}

	const normalizedOrigin = origin.replace(/\/$/, "");
	return cachedOrigins.has(normalizedOrigin);
}

/**
 * Clear cache (dipanggil setelah project di-create/update)
 */
export async function refreshOriginsCache(): Promise<void> {
	cachedOrigins = await fetchOriginsFromDB();
}

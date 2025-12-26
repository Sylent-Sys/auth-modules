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

import { SQL } from "bun";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not defined in environment variables");
}

// Bun SQL untuk query biasa (tagged template)
export const sql = new SQL({
	url: process.env.DATABASE_URL,
	connectionTimeout: 10,
	idleTimeout: 30,
});

// MySQL2 pool untuk migrasi (execute raw SQL)
export const pool = mysql.createPool(process.env.DATABASE_URL);

export const closeConnection = async () => {
	await sql.close();
	await pool.end();
};

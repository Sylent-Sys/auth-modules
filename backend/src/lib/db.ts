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

import { pool, closeConnection } from "../lib/db";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RowDataPacket } from "mysql2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==========================================
// UTILS & TEMPLATES (Bagian dari Maker)
// ==========================================

function generateTimestamp(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const date = String(now.getDate()).padStart(2, "0");
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const seconds = String(now.getSeconds()).padStart(2, "0");
	return `${year}${month}${date}${hours}${minutes}${seconds}`;
}

function toSnakeCase(str: string): string {
	return str
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");
}

function generateMigrationTemplate(name: string): string {
	return `-- Migration: ${name}
-- Created at: ${new Date().toISOString()}

CREATE TABLE ${name} (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`;
}

function generateSeedTemplate(name: string): string {
	return `-- Seeder: ${name}
-- Created at: ${new Date().toISOString()}

INSERT INTO ${name} (name) VALUES ('Sample Data');
`;
}

// ==========================================
// MAKER LOGIC
// ==========================================

async function handleMake(type: "table" | "seed", name: string) {
	if (!name) {
		console.error(`❌ Error: Name is required for ${type}`);
		process.exit(1);
	}

	const timestamp = generateTimestamp();
	const snakeCaseName = toSnakeCase(name);
	const filename = `${timestamp}_${snakeCaseName}.sql`;

	// Menentukan folder: 'table' untuk migrasi schema, 'seed' untuk data
	const targetDir = join(__dirname, type);
	const template =
		type === "table"
			? generateMigrationTemplate(snakeCaseName)
			: generateSeedTemplate(snakeCaseName);

	try {
		await fs.mkdir(targetDir, { recursive: true });
		const filePath = join(targetDir, filename);
		await fs.writeFile(filePath, template, "utf-8");

		console.log(`✅ Created ${type} file:`);
		console.log(`   📄 ${filePath}`);
	} catch (error) {
		console.error("💥 Error creating file:", error);
		process.exit(1);
	}
}

// ==========================================
// RUNNER LOGIC (Bagian dari Run)
// ==========================================

async function initializeMigrationsTable(): Promise<void> {
	const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT TABLE_NAME FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '_migrations'
  `);

	if (rows.length === 0) {
		await pool.query(`
      CREATE TABLE _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        batch INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE INDEX unique_type_name (type, name)
      ) ENGINE=InnoDB
    `);
		console.log("📋 Created _migrations tracking table");
	}
}

async function getExecutedMigrations(): Promise<Set<string>> {
	try {
		const [rows] = await pool.query<RowDataPacket[]>(
			`SELECT name, type FROM _migrations`,
		);
		return new Set(rows.map((row) => `${row.type}:${row.name}`));
	} catch {
		return new Set();
	}
}

async function getLatestBatch(): Promise<number> {
	try {
		const [rows] = await pool.query<RowDataPacket[]>(
			`SELECT MAX(batch) as max_batch FROM _migrations`,
		);
		return (rows[0]?.max_batch ?? 0) + 1;
	} catch {
		return 1;
	}
}

async function recordMigration(
	name: string,
	type: string,
	batch: number,
): Promise<void> {
	await pool.query(
		`INSERT INTO _migrations (name, type, batch) VALUES (?, ?, ?)`,
		[name, type, batch],
	);
}

async function executeMigration(
	filePath: string,
	filename: string,
): Promise<boolean> {
	try {
		// Read SQL file and normalize line endings
		const content = await fs.readFile(filePath, "utf-8");

		// Normalize line endings and remove BOM if present
		const normalized = content
			.replace(/^\uFEFF/, "") // Remove BOM
			.replace(/\r\n/g, "\n") // Normalize CRLF to LF
			.replace(/\r/g, "\n"); // Normalize CR to LF

		// Remove SQL comments
		const withoutComments = normalized
			.replace(/--.*$/gm, "")
			.replace(/\/\*[\s\S]*?\*\//g, "")
			.trim();

		if (!withoutComments) {
			console.error(`   ❌ ${filename}: No SQL statements found`);
			return false;
		}

		// Use mysql2 pool for executing raw SQL (more stable)
		await pool.query(withoutComments);

		console.log(`   ✅ ${filename}`);
		return true;
	} catch (error) {
		console.error(`   ❌ ${filename}: Execution failed`);
		console.error(
			`      ${error instanceof Error ? error.message : String(error)}`,
		);
		return false;
	}
}

async function handleRun() {
	console.log("🚀 Starting Database Migrations & Seeding...\n");

	try {
		await initializeMigrationsTable();

		const executedMigrations = await getExecutedMigrations();
		const nextBatch = await getLatestBatch();
		let totalExecuted = 0;

		// Helper untuk load file
		const loadFiles = async (dirName: string) => {
			const dirPath = join(__dirname, dirName);
			try {
				const files = await fs.readdir(dirPath);
				return files.filter((f) => f.endsWith(".sql")).sort();
			} catch {
				return [];
			}
		};

		console.log("\n🏗️  [SCHEMA] Running table migrations...");
		const tableFiles = await loadFiles("table");

		for (const file of tableFiles) {
			const identity = `table:${file}`;
			if (!executedMigrations.has(identity)) {
				const filePath = join(__dirname, "table", file);
				const success = await executeMigration(filePath, file);

				if (success) {
					await recordMigration(file, "table", nextBatch);
					totalExecuted++;
				} else {
					throw new Error(`Migration failed: ${file}`);
				}
			}
		}

		if (tableFiles.every((f) => executedMigrations.has(`table:${f}`)))
			console.log("   ⏭️  No pending migrations");

		console.log("\n🌱 [SEEDER] Running seeders...");
		const seedFiles = await loadFiles("seed");

		for (const file of seedFiles) {
			const identity = `seed:${file}`;
			if (!executedMigrations.has(identity)) {
				const filePath = join(__dirname, "seed", file);
				const success = await executeMigration(filePath, file);

				if (success) {
					await recordMigration(file, "seed", nextBatch);
					totalExecuted++;
				} else {
					throw new Error(`Seeder failed: ${file}`);
				}
			}
		}

		if (seedFiles.every((f) => executedMigrations.has(`seed:${f}`)))
			console.log("   ⏭️  No pending seeders");

		console.log(
			`\n✨ Completed! Executed ${totalExecuted} item(s) in batch ${nextBatch}`,
		);
	} catch (error) {
		console.error("\n💥 Critical Error:", error);
		process.exit(1);
	} finally {
		await closeConnection();
	}
}

// ==========================================
// MAIN DISPATCHER
// ==========================================

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];
	const name = args[1];
	if (!command) {
		console.log("❌ Error: Command is required");
		process.exit(1);
	}
	if (!name && (command.startsWith("make:") || command.startsWith("create:"))) {
		console.log("❌ Error: Name is required for make commands");
		process.exit(1);
	}
	switch (command) {
		case "up":
		case "run":
			await handleRun();
			break;

		case "make:migration":
		case "create:migration":
			await handleMake("table", name ?? "");
			process.exit(0);
			break;

		case "make:seed":
		case "create:seed":
			await handleMake("seed", name ?? "");
			process.exit(0);
			break;

		case "make:all":
		case "create:all":
			await handleMake("table", name ?? "");
			await handleMake("seed", name ?? "");
			process.exit(0);
			break;

		default:
			console.log("📖 Database Migration Tool");
			console.log("\nUsage:");
			console.log(
				"  bun run src/migrations/migrate.ts up                    # Run pending migrations & seeds",
			);
			console.log(
				"  bun run src/migrations/migrate.ts make:migration <name> # Create new table migration",
			);
			console.log(
				"  bun run src/migrations/migrate.ts make:seed <name>      # Create new seeder",
			);
			process.exit(0);
	}
}

main();

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

// Script to hash a password for seeding
// Run: bun run src/scripts/hash-password.ts <password>
// Example: bun run src/scripts/hash-password.ts mysecretpassword

import { hashPassword } from "../lib/password";

async function main() {
	const password = process.argv[2];

	if (!password) {
		console.log("❌ Usage: bun run src/scripts/hash-password.ts <password>");
		console.log("\nExample:");
		console.log("  bun run src/scripts/hash-password.ts mysecretpassword");
		process.exit(1);
	}

	console.log(`\n🔐 Hashing password: "${password}"\n`);

	const hash = await hashPassword(password);

	console.log("=== Hashed Password (Argon2id) ===");
	console.log(hash);

	console.log("\n=== For SQL seed file ===");
	console.log(`'${hash}'`);

	console.log("\n✅ Copy the hash above to your seed file!");
}

main();

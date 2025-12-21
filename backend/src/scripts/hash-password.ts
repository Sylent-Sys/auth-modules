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

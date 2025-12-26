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

// Script to generate RSA key pair for JWT RS256
// Run: bun run src/scripts/generate-keys.ts

import { generateKeyPair } from "../lib/jwt";

const { publicKey, privateKey } = generateKeyPair();

console.log("🔐 Generated RSA Key Pair for JWT RS256\n");
console.log("=== PRIVATE KEY (Keep this SECRET!) ===");
console.log(privateKey);
console.log("\n=== PUBLIC KEY (Share with client projects) ===");
console.log(publicKey);

// Format for .env file (escape newlines)
console.log("\n=== For .env file (copy these values) ===\n");

const privateKeyEnv = privateKey.replace(/\n/g, "\\n");
const publicKeyEnv = publicKey.replace(/\n/g, "\\n");

console.log(`JWT_PRIVATE_KEY="${privateKeyEnv}"\n`);
console.log(`JWT_PUBLIC_KEY="${publicKeyEnv}"`);

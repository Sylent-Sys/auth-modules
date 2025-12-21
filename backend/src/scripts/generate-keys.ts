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

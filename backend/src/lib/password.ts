// Password hashing utilities using Bun's built-in password API
// Uses Argon2id by default (recommended) or bcrypt

export async function hashPassword(password: string): Promise<string> {
	return await Bun.password.hash(password, {
		algorithm: "argon2id",
		memoryCost: 65536, // 64 MB
		timeCost: 2,
	});
}

export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return await Bun.password.verify(password, hash);
}

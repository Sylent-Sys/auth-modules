import * as crypto from "node:crypto";

// JWT RS256 utilities untuk Auth Modules
// Private key untuk sign, Public key untuk verify

const ALGORITHM = "RS256";

interface JWTPayload {
	iss: string;
	sub: string;
	aud: string;
	iat: number;
	exp: number;
	data: {
		email: string;
		name: string;
		role: string;
	};
}

// Base64URL encode
function base64UrlEncode(data: string | Buffer): string {
	const base64 = Buffer.from(data).toString("base64");
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Base64URL decode
function base64UrlDecode(data: string): string {
	const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
	const padding = "=".repeat((4 - (base64.length % 4)) % 4);
	return Buffer.from(base64 + padding, "base64").toString("utf-8");
}

// Sign JWT with RS256
export function signJWT(
	payload: Omit<JWTPayload, "iat" | "exp">,
	privateKey: string,
	expiresInSeconds: number = 3600,
): string {
	const header = {
		alg: ALGORITHM,
		typ: "JWT",
	};

	const now = Math.floor(Date.now() / 1000);
	const fullPayload: JWTPayload = {
		...payload,
		iat: now,
		exp: now + expiresInSeconds,
	};

	const headerEncoded = base64UrlEncode(JSON.stringify(header));
	const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
	const signingInput = `${headerEncoded}.${payloadEncoded}`;

	const sign = crypto.createSign("RSA-SHA256");
	sign.update(signingInput);
	const signature = sign.sign(privateKey, "base64");
	const signatureEncoded = signature
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

	return `${signingInput}.${signatureEncoded}`;
}

// Verify JWT with RS256
export function verifyJWT(
	token: string,
	publicKey: string,
): { valid: boolean; payload?: JWTPayload; error?: string } {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) {
			return { valid: false, error: "Invalid token format" };
		}

		const headerEncoded = parts[0] as string;
		const payloadEncoded = parts[1] as string;
		const signatureEncoded = parts[2] as string;
		const signingInput = `${headerEncoded}.${payloadEncoded}`;

		// Verify signature
		const signature = signatureEncoded.replace(/-/g, "+").replace(/_/g, "/");
		const verify = crypto.createVerify("RSA-SHA256");
		verify.update(signingInput);

		const isValid = verify.verify(publicKey, signature, "base64");
		if (!isValid) {
			return { valid: false, error: "Invalid signature" };
		}

		// Decode payload
		const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadEncoded));

		// Check expiration
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp < now) {
			return { valid: false, error: "Token expired" };
		}

		return { valid: true, payload };
	} catch (_error) {
		return { valid: false, error: "Token verification failed" };
	}
}

// Generate RSA key pair (untuk development/setup)
export function generateKeyPair(): { publicKey: string; privateKey: string } {
	const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: "spki",
			format: "pem",
		},
		privateKeyEncoding: {
			type: "pkcs8",
			format: "pem",
		},
	});

	return { publicKey, privateKey };
}

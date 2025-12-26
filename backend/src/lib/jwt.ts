import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";

/*
	Replace hand-rolled JWT implementation with `jose`.
	Exports async helpers that sign/verify RS256 JWTs using PEM keys.
*/

interface JWTPayload {
	iss: string;
	sub: string;
	aud: string;
	iat?: number;
	exp?: number;
	data: {
		email: string;
		name: string;
		role: string;
	};
}

export async function signJWT(
	payload: Omit<JWTPayload, "iat" | "exp">,
	privateKeyPem: string,
	expiresInSeconds: number = 3600,
): Promise<string> {
	const pk = await importPKCS8(privateKeyPem, "RS256");
	const now = Math.floor(Date.now() / 1000);

	// include `data` as a claim to preserve existing shape
	return await new SignJWT({ data: payload.data })
		.setProtectedHeader({ alg: "RS256" })
		.setIssuer(payload.iss)
		.setSubject(payload.sub)
		.setAudience(payload.aud)
		.setIssuedAt(now)
		.setExpirationTime(now + expiresInSeconds)
		.sign(pk);
}

export async function verifyJWT(
	token: string,
	publicKeyPem: string,
): Promise<{ valid: boolean; payload?: JWTPayload; error?: string }> {
	try {
		const pub = await importSPKI(publicKeyPem, "RS256");
		const { payload: rawPayload } = await jwtVerify(token, pub, {
			algorithms: ["RS256"],
		});

		const iss = typeof rawPayload.iss === "string" ? rawPayload.iss : "";
		const sub = typeof rawPayload.sub === "string" ? rawPayload.sub : "";
		const aud = typeof rawPayload.aud === "string" ? rawPayload.aud : "";
		const iat = typeof rawPayload.iat === "number" ? rawPayload.iat : undefined;
		const exp = typeof rawPayload.exp === "number" ? rawPayload.exp : undefined;

		const rawData = (rawPayload as Record<string, unknown>).data;
		let data: JWTPayload["data"] = { email: "", name: "", role: "" };
		if (rawData && typeof rawData === "object") {
			const d = rawData as Record<string, unknown>;
			data = {
				email: typeof d.email === "string" ? d.email : "",
				name: typeof d.name === "string" ? d.name : "",
				role: typeof d.role === "string" ? d.role : "",
			};
		}

		const result: JWTPayload = {
			iss,
			sub,
			aud,
			iat,
			exp,
			data,
		};

		return { valid: true, payload: result };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return { valid: false, error: message };
	}
}

// Generate RSA key pair helper for development (kept for convenience)
import * as crypto from "node:crypto";
export function generateKeyPair(): { publicKey: string; privateKey: string } {
	const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: { type: "spki", format: "pem" },
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
	});

	return { publicKey, privateKey };
}

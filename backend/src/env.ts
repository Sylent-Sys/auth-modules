import { z } from "zod/v4";

const envSchema = z.object({
	JWT_PRIVATE_KEY: z.string().min(1),
	JWT_PUBLIC_KEY: z.string().min(1),
	JWT_ISSUER: z.string().optional(),
	JWT_EXPIRES_IN: z.string().optional(),
	CORS_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
	throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const JWT_PRIVATE_KEY = parsed.data.JWT_PRIVATE_KEY.replace(
	/\\n/g,
	"\n",
);
export const JWT_PUBLIC_KEY = parsed.data.JWT_PUBLIC_KEY.replace(/\\n/g, "\n");
export const JWT_ISSUER = parsed.data.JWT_ISSUER || "https://auth-modules.com";
export const JWT_EXPIRES_IN = parseInt(
	parsed.data.JWT_EXPIRES_IN || "3600",
	10,
);
export const CORS_ORIGINS = parsed.data.CORS_ORIGINS || "";

export default {
	JWT_PRIVATE_KEY,
	JWT_PUBLIC_KEY,
	JWT_ISSUER,
	JWT_EXPIRES_IN,
	CORS_ORIGINS,
};

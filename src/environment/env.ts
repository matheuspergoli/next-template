import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
		TURSO_CONNECTION_URL: z.string(),
		TURSO_AUTH_TOKEN: z.string(),
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		CLOUDINARY_API_KEY: z.string(),
		CLOUDINARY_CLOUD_NAME: z.string(),
		CLOUDINARY_API_SECRET: z.string(),
		RESEND_API_KEY: z.string(),
		RESEND_DOMAIN: z.string()
	},
	client: {},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		RESEND_DOMAIN: process.env.RESEND_DOMAIN,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
		TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL,
		CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
		CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
		CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
	},

	emptyStringAsUndefined: true,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION
})

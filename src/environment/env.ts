import { z } from "zod"

const envSchema = z.object({
	// Node variables
	NODE_ENV: z.enum(["development", "production", "test"]),

	// Database variables
	DATABASE_URL: z.string(),

	// Rate Limit variables
	RATE_LIMIT_MAX: z.string().transform((val) => Number(val)),
	RATE_LIMIT_INTERVAL: z.string().transform((val) => Number(val)),

	// NextAuth variables
	NEXTAUTH_URL: z.string(),
	NEXTAUTH_SECRET: z.string(),

	// Github oauth variables
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),

	// Cloudinary variables
	CLOUDINARY_API_KEY: z.string(),
	CLOUDINARY_CLOUD_NAME: z.string(),
	CLOUDINARY_API_SECRET: z.string()
})

export const env = envSchema.parse(process.env)

import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		// Node variables
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

		// Database variables
		DATABASE_URL: z.string(),

		// Rate limit variables
		RATE_LIMIT_MAX: z.string().transform((v) => Number(v)),
		RATE_LIMIT_INTERVAL: z.string().transform((v) => Number(v)),

		// NextAuth variables
		NEXTAUTH_URL: z.preprocess(
			(v) => process.env.VERCEL_URL ?? v,
			process.env.VERCEL_URL ? z.string() : z.string().url()
		),
		NEXTAUTH_SECRET:
			process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),

		// GitHub oauth variables
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),

		// Cloudinary variables
		CLOUDINARY_API_KEY: z.string(),
		CLOUDINARY_CLOUD_NAME: z.string(),
		CLOUDINARY_API_SECRET: z.string()
	},
	client: {},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,
		RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
		RATE_LIMIT_INTERVAL: process.env.RATE_LIMIT_INTERVAL,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
		CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
		CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
		CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
	}
})

import { z } from 'zod'
import { createEnv } from '@t3-oss/env-nextjs'

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().url(),
		CLOUDINARY_API_KEY: z.string(),
		CLOUDINARY_API_SECRET: z.string(),
		CLOUDINARY_CLOUD_NAME: z.string(),
		NEXTAUTH_SECRET: z.string(),
		NEXTAUTH_URL: z.preprocess(
			(str) => process.env.VERCEL_URL ?? str,
			process.env.VERCEL ? z.string().min(1) : z.string().url()
		),
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),
		NODE_ENV: z.enum(['development', 'test', 'production'])
	}
})

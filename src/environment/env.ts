export const env = {
	PORT: process.env.PORT as string,
	NODE_ENV: process.env.NODE_ENV as string,
	VERCEL_URL: process.env.VERCEL_URL as string,
	DATABASE_URL: process.env.DATABASE_URL as string,
	NEXTAUTH_URL: process.env.NEXTAUTH_URL as string,
	RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX as string,
	NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
	RATE_LIMIT_INTERVAL: process.env.RATE_LIMIT_INTERVAL as string,
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string,
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string
}

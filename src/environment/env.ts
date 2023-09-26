export const env = {
	NODE_ENV: process.env.NODE_ENV as string,
	DATABASE_URL: process.env.DATABASE_URL as string,
	NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
	NEXTAUTH_URL: process.env.NEXTAUTH_URL as string,
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string,
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string
}

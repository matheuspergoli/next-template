import { defineConfig } from "drizzle-kit"

if (!process.env.TURSO_CONNECTION_URL || !process.env.TURSO_AUTH_TOKEN) {
	throw new Error(
		"TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN must be set in the environment"
	)
}

export default defineConfig({
	schema: "./src/server/db/schema.ts",
	out: "./migrations",
	dialect: "sqlite",
	driver: "turso",
	dbCredentials: {
		url: process.env.TURSO_CONNECTION_URL,
		authToken: process.env.TURSO_AUTH_TOKEN
	}
})

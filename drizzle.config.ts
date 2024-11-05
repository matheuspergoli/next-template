import { defineConfig } from "drizzle-kit"

import { env } from "./src/environment/env"

export default defineConfig({
	schema: "./src/server/db/schema.ts",
	out: "./migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: env.DATABASE_URL
	}
})

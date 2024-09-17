import { createClient } from "@libsql/client"
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle"
import { drizzle } from "drizzle-orm/libsql"

import { env } from "@/environment/env"

import * as schema from "./schema"

const client = createClient({
	url: env.TURSO_CONNECTION_URL,
	authToken: env.TURSO_AUTH_TOKEN
})

export const db = drizzle(client, {
	schema
})

export const adapter = new DrizzleSQLiteAdapter(db, schema.sessions, schema.users)

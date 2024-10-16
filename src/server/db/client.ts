import { createClient, type Client, type Config } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import { env } from "@/environment/env"

import * as schema from "./schema"

const globalForDb = globalThis as unknown as {
	client: Client | undefined
}

const config: Config = {
	url: env.TURSO_CONNECTION_URL,
	authToken: env.TURSO_AUTH_TOKEN
}

export const client = globalForDb.client ?? createClient(config)

if (env.NODE_ENV === "production") globalForDb.client = client

export const db = drizzle(client, {
	schema
})

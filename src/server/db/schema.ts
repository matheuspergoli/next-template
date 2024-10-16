import { sql } from "drizzle-orm"
import {
	customType,
	integer,
	primaryKey,
	sqliteTable,
	text
} from "drizzle-orm/sqlite-core"

export type Roles = "user" | "admin" | "superadmin"
export type OauthProviderIds = "github" | "google"

export const roles = customType<{ data: Roles }>({
	dataType() {
		return "user"
	}
})

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	passwordHash: text("password_hash"),
	username: text("username").notNull(),
	email: text("email").unique().notNull(),
	role: roles("role").notNull().default("user"),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`)
		.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
})

export const oauthProviderIds = customType<{ data: OauthProviderIds }>({
	dataType() {
		return "github"
	}
})

export const oauthAccounts = sqliteTable(
	"oauth_accounts",
	{
		providerUserId: text("provider_user_id").notNull(),
		providerId: oauthProviderIds("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`)
			.$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.providerId, table.providerUserId] })
		}
	}
)

export const emailVerificationCodes = sqliteTable("email_verification_codes", {
	id: text("id").primaryKey(),
	email: text("email").notNull(),
	userId: text("user_id").notNull(),
	code: text("code").unique().notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull()
})

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
	userId: text("user_id").notNull(),
	tokenHash: text("token_hash").unique().notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull()
})

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull()
})

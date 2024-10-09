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
	username: text("username").notNull(),
	email: text("email").unique().notNull(),
	passwordHash: text("password_hash"),
	role: roles("role").notNull().default("user"),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
	createdAt: text("created_at")
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updated_at")
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
		providerId: oauthProviderIds("provider_id").notNull(),
		providerUserId: text("provider_user_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: text("created_at")
			.notNull()
			.default(sql`(CURRENT_TIMESTAMP)`),
		updatedAt: text("updated_at")
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
	code: text("code").unique().notNull(),
	userId: text("user_id").notNull(),
	email: text("email").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull()
})

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
	tokenHash: text("token_hash").unique().notNull(),
	userId: text("user_id").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull()
})

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expiresAt: integer("expires_at").notNull()
})

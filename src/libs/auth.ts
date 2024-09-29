import { cookies } from "next/headers"

import { GitHub, Google } from "arctic"
import { Lucia, type Session, type User } from "lucia"

import { env } from "@/environment/env"
import { adapter } from "@/server/db/client"
import { users } from "@/server/db/schema"

import { getBaseUrl } from "./utils"

type DatabaseUser = Omit<typeof users.$inferSelect, "passwordHash">

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		name: "session",
		attributes: {
			secure: env.NODE_ENV === "production"
		}
	},
	getSessionAttributes: () => ({}),
	getUserAttributes: (attr): DatabaseUser => {
		return {
			id: attr.id,
			role: attr.role,
			email: attr.email,
			username: attr.username,
			emailVerified: attr.emailVerified
		}
	}
})

export const validateRequest = async (): Promise<
	{ user: User; session: Session } | { user: null; session: null }
> => {
	const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null

	if (!sessionId) {
		return {
			user: null,
			session: null
		}
	}

	const result = await lucia.validateSession(sessionId)

	try {
		if (result.session && result.session.fresh) {
			const sessionCookie = lucia.createSessionCookie(result.session.id)
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		}

		if (!result.session) {
			const sessionCookie = lucia.createBlankSessionCookie()
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
		}
	} catch {
		return {
			user: null,
			session: null
		}
	}

	return result
}

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia
		DatabaseUserAttributes: DatabaseUser
		DatabaseSessionAttributes: Record<string, never>
	}
}

export const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET)

export const google = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	`${getBaseUrl()}/api/login/google/callback`
)

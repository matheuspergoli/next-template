import { cache } from "react"
import { cookies } from "next/headers"

import { sha256 } from "@oslojs/crypto/sha2"
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding"
import { GitHub, Google } from "arctic"
import { eq } from "drizzle-orm"

import { env } from "@/environment/env"
import { db } from "@/server/db/client"
import { sessions, users } from "@/server/db/schema"

import { createDate, isWithinExpirationDate, TimeSpan } from "./time-span"
import { getBaseUrl } from "./utils"

export type Session = typeof sessions.$inferSelect

export type User = Omit<
	typeof users.$inferSelect,
	"passwordHash" | "createdAt" | "updatedAt"
>

type SessionValidationResult =
	| {
			session: Session
			user: User
	  }
	| {
			session: null
			user: null
	  }

export const generateSessionToken = () => {
	const tokenBytes = new Uint8Array(20)
	crypto.getRandomValues(tokenBytes)
	const token = encodeBase32LowerCaseNoPadding(tokenBytes)
	return token
}

export const createSession = async ({
	token,
	userId
}: {
	token: string
	userId: string
}): Promise<Session> => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

	const sessionDuration = new TimeSpan(30, "d") // 30 days

	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + sessionDuration.milliseconds())
	}

	await db.insert(sessions).values(session)

	return session
}

export const validateSessionToken = async ({
	token
}: {
	token: string
}): Promise<SessionValidationResult> => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

	const result = await db
		.select({
			user: users,
			session: sessions
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId))
		.get()

	if (!result) {
		return { user: null, session: null }
	}

	const {
		user: {
			updatedAt: _updatedAt,
			createdAt: _createdAt,
			passwordHash: _passwordhash,
			...user
		},
		session
	} = result

	const sessionDuration = new TimeSpan(30, "d") // 30 days
	const renewalThreshold = new TimeSpan(15, "d") // 15 days

	if (!isWithinExpirationDate(session.expiresAt)) {
		await db.delete(sessions).where(eq(sessions.id, sessionId))

		return { user: null, session: null }
	}

	if (Date.now() >= session.expiresAt.getTime() - renewalThreshold.milliseconds()) {
		session.expiresAt = createDate(sessionDuration)

		await db
			.update(sessions)
			.set({
				expiresAt: session.expiresAt
			})
			.where(eq(sessions.id, sessionId))
			.execute()
	}

	return { user, session }
}

export const invalidateSession = async ({ sessionId }: { sessionId: string }) => {
	await db.delete(sessions).where(eq(sessions.id, sessionId))
}

export const invalidateUserSessions = async ({ userId }: { userId: string }) => {
	await db.delete(sessions).where(eq(sessions.userId, userId))
}

export const setSessionTokenCookie = ({
	token,
	expiresAt
}: {
	token: string
	expiresAt: Date
}) => {
	cookies().set("session", token, {
		httpOnly: true,
		path: "/",
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	})
}

export const deleteSessionTokenCookie = () => {
	cookies().set("session", "", {
		httpOnly: true,
		path: "/",
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0
	})
}

export const getCurrentSession = cache(async () => {
	const token = cookies().get("session")?.value ?? null

	if (token === null) {
		return null
	}

	const { session } = await validateSessionToken({ token })

	if (!session) {
		return null
	}

	return session
})

export const getCurrentUser = cache(async () => {
	const token = cookies().get("session")?.value ?? null
	if (token === null) {
		return null
	}

	const { user } = await validateSessionToken({ token })

	if (!user) {
		return null
	}

	return user
})

export const setSession = async ({ userId }: { userId: string }) => {
	const token = generateSessionToken()
	const session = await createSession({ token, userId })

	setSessionTokenCookie({ token, expiresAt: session.expiresAt })
}

export const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET)

export const google = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	`${getBaseUrl()}/api/login/google/callback`
)

import { cache } from "react"
import { cookies } from "next/headers"

import { sha256 } from "@oslojs/crypto/sha2"
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding"
import { GitHub, Google } from "arctic"
import { eq } from "drizzle-orm"

import { env } from "@/environment/env"
import { db } from "@/server/db/client"
import {
	sessionsTable,
	usersTable,
	type SessionSelect,
	type UserSelect
} from "@/server/db/schema"

import { createDate, isWithinExpirationDate, TimeSpan } from "./time-span"
import { getBaseUrl } from "./utils"

export type Session = SessionSelect

export type User = Omit<UserSelect, "passwordHash">

type SessionValidationResult =
	| {
			session: Session
			user: User
	  }
	| {
			session: undefined
			user: undefined
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

	const sessionDuration = new TimeSpan(30, "d")

	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + sessionDuration.milliseconds())
	}

	await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
	await db.insert(sessionsTable).values(session)

	return session
}

export const validateSessionToken = async ({
	token
}: {
	token: string
}): Promise<SessionValidationResult> => {
	if (!token) {
		return { user: undefined, session: undefined }
	}

	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

	const session = await db
		.select()
		.from(sessionsTable)
		.where(eq(sessionsTable.id, sessionId))
		.get()

	if (!session) {
		return { user: undefined, session: undefined }
	}

	const user = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, session.userId))
		.get()

	if (!user) {
		await invalidateSession({ sessionId })
		return { user: undefined, session: undefined }
	}

	const { passwordHash: _passwordHash, ...userWithoutPassword } = user

	const sessionDuration = new TimeSpan(30, "d")
	const renewalThreshold = new TimeSpan(15, "d")

	if (!isWithinExpirationDate(session.expiresAt)) {
		await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))

		return { user: undefined, session: undefined }
	}

	if (Date.now() >= session.expiresAt.getTime() - renewalThreshold.milliseconds()) {
		const newExpiresAt = createDate(sessionDuration)

		await db
			.update(sessionsTable)
			.set({ expiresAt: newExpiresAt })
			.where(eq(sessionsTable.id, sessionId))
			.execute()

		session.expiresAt = newExpiresAt
	}

	return { user: userWithoutPassword, session }
}

export const invalidateSession = async ({ sessionId }: { sessionId: string }) => {
	await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
}

export const invalidateUserSessions = async ({ userId }: { userId: string }) => {
	await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId))
}

export const setSessionTokenCookie = async ({
	token,
	expiresAt
}: {
	token: string
	expiresAt: Date
}) => {
	const cooks = await cookies()

	cooks.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	})
}

export const deleteSessionTokenCookie = async () => {
	const cooks = await cookies()

	cooks.set("session", "", {
		httpOnly: true,
		path: "/",
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0
	})
}

export const getCurrentSession = cache(async () => {
	const cooks = await cookies()
	const token = cooks.get("session")?.value ?? null

	if (token === null) {
		return undefined
	}

	const { session } = await validateSessionToken({ token })

	if (!session) {
		await deleteSessionTokenCookie()
		return undefined
	}

	return session
})

export const getCurrentUser = cache(async () => {
	const cooks = await cookies()
	const token = cooks.get("session")?.value ?? null

	if (token === null) {
		return undefined
	}

	const { user } = await validateSessionToken({ token })

	if (!user) {
		await deleteSessionTokenCookie()
		return undefined
	}

	return user
})

export const setSession = async ({ userId }: { userId: string }) => {
	await invalidateUserSessions({ userId })
	await deleteSessionTokenCookie()

	const token = generateSessionToken()
	const session = await createSession({ token, userId })

	if (!session) {
		throw new Error("Failed to create session")
	}

	setSessionTokenCookie({ token, expiresAt: session.expiresAt })
}

export const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, null)

export const google = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	`${getBaseUrl()}/api/login/google/callback`
)

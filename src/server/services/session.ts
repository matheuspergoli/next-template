import { cache } from "react"
import { cookies } from "next/headers"

import { sha256 } from "@oslojs/crypto/sha2"
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding"
import { eq } from "drizzle-orm"

import { env } from "@/environment/env"
import { createDate, isWithinExpirationDate, TimeSpan } from "@/libs/time-span"
import { db } from "@/server/db/client"
import {
	sessionsTable,
	usersTable,
	type SessionSelect,
	type UserSelect
} from "@/server/db/schema"

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

const SESSION_DURATION = new TimeSpan(30, "d")
const RENEWAL_THRESHOLD = new TimeSpan(15, "d")

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

	await db.transaction(async (tx) => {
		await tx.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
		await tx.insert(sessionsTable).values(session)
	})

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

	const result = await db
		.select({
			session: sessionsTable,
			user: {
				id: usersTable.id,
				email: usersTable.email,
				createdAt: usersTable.createdAt,
				updatedAt: usersTable.updatedAt
			}
		})
		.from(sessionsTable)
		.leftJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
		.where(eq(sessionsTable.id, sessionId))
		.get()

	if (!result?.session || !result.user) {
		await invalidateSession({ sessionId })

		return { user: undefined, session: undefined }
	}

	const { session, user } = result

	if (!isWithinExpirationDate(result.session.expiresAt)) {
		await invalidateSession({ sessionId })

		return { user: undefined, session: undefined }
	}

	if (Date.now() >= session.expiresAt.getTime() - RENEWAL_THRESHOLD.milliseconds()) {
		const newExpiresAt = createDate(SESSION_DURATION)

		await db
			.update(sessionsTable)
			.set({ expiresAt: newExpiresAt })
			.where(eq(sessionsTable.id, sessionId))
			.execute()

		session.expiresAt = newExpiresAt
	}

	return { user, session }
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
	const cookieStore = await cookies()

	cookieStore.set("session", token, {
		httpOnly: true,
		path: "/",
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	})
}

export const deleteSessionTokenCookie = async () => {
	const cookieStore = await cookies()

	cookieStore.set("session", "", {
		httpOnly: true,
		path: "/",
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0
	})
}

export const getCurrentSession = cache(async () => {
	const cookieStore = await cookies()
	const token = cookieStore.get("session")?.value ?? null

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
	const cookieStore = await cookies()
	const token = cookieStore.get("session")?.value ?? null

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

	await setSessionTokenCookie({ token, expiresAt: session.expiresAt })
}

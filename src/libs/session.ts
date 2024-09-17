import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"

import { lucia, validateRequest } from "./auth"

export const getCurrentUser = cache(async () => {
	const { user } = await validateRequest()

	if (!user) {
		return null
	}

	return user
})

export const getCurrentSession = cache(async () => {
	const { session } = await validateRequest()

	if (!session) {
		return null
	}

	return session
})

export const setSession = async ({ userId }: { userId: string }) => {
	const session = await lucia.createSession(userId, {})
	const sessionCookie = lucia.createSessionCookie(session.id)
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
}

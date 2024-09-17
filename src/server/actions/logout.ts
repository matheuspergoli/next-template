"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ActionError } from "safe-action"

import { lucia } from "@/libs/auth"
import { getCurrentSession } from "@/libs/session"
import { routes } from "@/shared/navigation/routes"

import { publicAction } from "../root"

export const logout = publicAction.execute(async () => {
	const session = await getCurrentSession()

	if (!session) {
		throw new ActionError({
			code: "UNAUTHORIZED",
			message: "No session found"
		})
	}

	await lucia.invalidateSession(session.id)

	const sessionCookie = lucia.createBlankSessionCookie()
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

	redirect(routes.home())
})

"use server"

import { redirect } from "next/navigation"

import { ActionError } from "safe-action"

import {
	deleteSessionTokenCookie,
	getCurrentSession,
	invalidateSession
} from "@/libs/auth"
import { routes } from "@/shared/navigation/routes"

import { globalPOSTRateLimitMiddleware, publicAction } from "../root"

export const logout = publicAction
	.middleware(globalPOSTRateLimitMiddleware)
	.execute(async () => {
		const session = await getCurrentSession()

		if (!session) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "No session found"
			})
		}

		await invalidateSession({ sessionId: session.id })
		deleteSessionTokenCookie()

		redirect(routes.home())
	})

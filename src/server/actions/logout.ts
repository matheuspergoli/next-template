"use server"

import { deleteSessionTokenCookie, invalidateSession } from "@/libs/auth"

import { authedAction } from "../root"

export const logout = authedAction.execute(async ({ ctx }) => {
	await invalidateSession({ sessionId: ctx.session.id })
	await deleteSessionTokenCookie()
})

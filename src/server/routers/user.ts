import {
	deleteSessionTokenCookie,
	getCurrentSession,
	getCurrentUser,
	invalidateSession
} from "@/libs/session"

import { authedProcedure, createTRPCRouter, publicProcedure } from "../trpc"

export const userRouter = createTRPCRouter({
	assertGetCurrentSession: authedProcedure.query(({ ctx }) => {
		return ctx.session
	}),
	assertGetCurrentUser: authedProcedure.query(({ ctx }) => {
		return ctx.user
	}),
	getCurrentUser: publicProcedure.query(async () => {
		const user = await getCurrentUser()
		return user
	}),
	getCurrentSession: publicProcedure.query(async () => {
		const session = await getCurrentSession()
		return session
	}),
	logout: authedProcedure.mutation(async ({ ctx }) => {
		await invalidateSession({ sessionId: ctx.session.id })
		await deleteSessionTokenCookie()
	})
})

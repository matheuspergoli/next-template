import { initTRPC, TRPCError } from "@trpc/server"
import SuperJSON from "superjson"
import { ZodError } from "zod"

import { db } from "./db/client"
import { getCurrentSession, getCurrentUser } from "./services/session"

interface Context {
	headers: Headers
}

export const createTRPCContext = (opts: Context) => {
	return {
		db,
		...opts
	}
}

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: SuperJSON,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
			}
		}
	}
})

export const createTRPCRouter = t.router

export const createCallerFactory = t.createCallerFactory

const timingMiddleware = t.middleware(async ({ next, path }) => {
	const start = Date.now()

	if (t._config.isDev) {
		const waitMs = Math.floor(Math.random() * 400) + 100
		await new Promise((resolve) => setTimeout(resolve, waitMs))
	}

	const result = await next()

	const end = Date.now()
	console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

	return result
})

export const publicProcedure = t.procedure.use(timingMiddleware)

export const authedProcedure = publicProcedure.use(async ({ next }) => {
	const [user, session] = await Promise.all([getCurrentUser(), getCurrentSession()])

	if (!user?.id || !session?.userId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Not logged in"
		})
	}

	return next({
		ctx: {
			user,
			session
		}
	})
})

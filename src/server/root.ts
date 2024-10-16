import "server-only"

import { ActionError, CreateAction } from "safe-action"

import { getCurrentUser } from "@/libs/auth"
import { getIp } from "@/libs/get-ip"
import { globalPOSTRateLimit } from "@/libs/rate-limit"

import { db } from "./db/client"

const context = () => {
	const clientIP = getIp()

	return {
		db,
		clientIP
	}
}

const action = CreateAction.context(context).client({
	errorHandler: (error) => {
		if (error.code !== "NEXT_ERROR") {
			console.log("ActionError", error)
		}
	}
})

export const createActionMiddleware = action.middleware

export const globalPOSTRateLimitMiddleware = createActionMiddleware(({ ctx, next }) => {
	if (!ctx.clientIP) {
		throw new ActionError({
			code: "FORBIDDEN",
			message: "Could not get client IP"
		})
	}

	if (!globalPOSTRateLimit({ clientIP: ctx.clientIP })) {
		throw new ActionError({
			code: "TOO_MANY_REQUESTS",
			message: "Too many requests"
		})
	}

	return next({
		ctx: {
			clientIP: ctx.clientIP
		}
	})
})

export const publicAction = action.create

export const authedAction = publicAction.middleware(async ({ next }) => {
	const user = await getCurrentUser()

	if (!user?.id) {
		throw new ActionError({
			code: "UNAUTHORIZED",
			message: "You are not authorized to perform this action"
		})
	}

	return next({
		ctx: {
			user
		}
	})
})

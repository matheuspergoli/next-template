import { ActionError, CreateAction } from "safe-action"

import { getCurrentSession, getCurrentUser } from "@/libs/auth"
import { getIp } from "@/libs/get-ip"

import { db } from "./db/client"

const context = async () => {
	const clientIP = await getIp()

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

export const publicAction = action.create

export const authedAction = publicAction.middleware(async ({ next, ctx }) => {
	if (!ctx.clientIP) {
		throw new ActionError({
			code: "FORBIDDEN",
			message: "Client IP missing"
		})
	}

	const user = await getCurrentUser()
	const session = await getCurrentSession()

	if (!user?.id || !session?.userId) {
		throw new ActionError({
			code: "UNAUTHORIZED",
			message: "You are not authorized to perform this action"
		})
	}

	return next({
		ctx: {
			user,
			session,
			clientIP: ctx.clientIP
		}
	})
})

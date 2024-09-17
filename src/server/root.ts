import "server-only"

import { ActionError, CreateAction } from "safe-action"

import { getCurrentUser } from "@/libs/session"

import { db } from "./db/client"

const context = () => {
	return {
		db
	}
}

const action = CreateAction.context(context).create({
	errorHandler: (error) => {
		if (error.code !== "NEXT_ERROR") {
			console.log("ActionError", error)
		}
	}
})

export const publicAction = action

export const authedAction = action.middleware(async ({ next }) => {
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

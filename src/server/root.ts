import { ActionError, CreateAction } from "safe-action"

import { prisma } from "@/libs/prisma"

interface User {
	id: number
	name: string
	email: string
	role: "ADMIN" | "USER"
}

const getUser = () => {
	const user: User = {
		id: 1,
		name: "John Doe",
		email: "john.doe@email.com",
		role: "ADMIN"
	}

	return user
}

const context = async () => {
	const user = getUser()

	return {
		prisma,
		user
	}
}

const action = CreateAction.context(context).create({
	errorHandler: (error) => {
		console.log(error)
	}
})

export const publicAction = action

export const authedAction = action.middleware(({ ctx, next }) => {
	if (!ctx.user.id) {
		throw new ActionError({
			message: "User must be authenticated to perform this action",
			code: "UNAUTHORIZED"
		})
	}

	return next()
})

export const adminAction = authedAction.middleware(({ ctx, next }) => {
	if (ctx.user.role !== "ADMIN") {
		throw new ActionError({
			message: "User is not authorized to perform this action",
			code: "UNAUTHORIZED"
		})
	}

	return next()
})

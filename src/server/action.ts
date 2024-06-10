import { actionBuilder, ActionError } from "@/libs/action"
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

const middlewareContext = async () => {
	const user = getUser()

	return {
		prisma,
		user
	}
}

const action = actionBuilder({
	middleware: middlewareContext,
	errorHandler: (error) => {
		console.log(error)
	}
})

export const publicAction = action.create

export const authedAction = action.create.use(({ ctx, next }) => {
	if (!ctx.user.id) {
		throw new ActionError({
			message: "User must be authenticated to perform this action",
			code: "UNAUTHORIZED"
		})
	}

	return next({ ctx })
})

export const adminAction = authedAction.use(({ ctx, next }) => {
	if (ctx.user.role !== "ADMIN") {
		throw new ActionError({
			message: "User is not authorized to perform this action",
			code: "UNAUTHORIZED"
		})
	}

	return next({ ctx })
})

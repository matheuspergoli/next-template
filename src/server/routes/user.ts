import { z } from "zod"

import { ActionError } from "@/libs/action"
import { adminAction, authedAction, publicAction } from "@/server/action"

export const userActions = {
	getById: publicAction
		.input(z.object({ id: z.number() }))
		.output(
			z.object({
				id: z.number(),
				name: z.string(),
				username: z.string()
			})
		)
		.execute(async ({ input }) => {
			if (input.id > 10) {
				throw new ActionError({
					message: "Id must be less than 10",
					code: "BAD_REQUEST"
				})
			}

			const response = await fetch(
				`https://jsonplaceholder.typicode.com/users/${input.id}`
			)

			const user = (await response.json()) as {
				id: number
				name: string
				username: string
			}

			return user
		}),

	getAll: authedAction.execute(async () => {
		const response = await fetch(`https://jsonplaceholder.typicode.com/users`)

		const users = (await response.json()) as {
			id: number
			name: string
			username: string
		}[]

		return users
	}),

	getAdmin: adminAction.execute(async ({ user }) => {
		return {
			...user,
			role: "ADMIN"
		}
	})
}

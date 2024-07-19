"use server"

import { ActionError } from "safe-action"
import { z } from "zod"

import { rateLimitByKey } from "@/libs/rate-limit"
import { publicAction } from "@/server/root"

export const getById = publicAction
	.input(z.object({ id: z.number() }))
	.output(
		z.object({
			id: z.number(),
			name: z.string(),
			username: z.string()
		})
	)
	.middleware(async ({ next, input }) => {
		await rateLimitByKey({ key: input.id.toString(), limit: 5, window: 10000 })
		return next()
	})
	.hook("onSuccess", ({ input }) => {
		console.log(`[User with id ${input.id} was fetched]`)
	})
	.execute(async ({ input }) => {
		if (input.id > 10) {
			throw new ActionError({
				message: "Id must be less than 10",
				code: "BAD_REQUEST"
			})
		}

		const response = await fetch(`https://jsonplaceholder.typicode.com/users/${input.id}`)

		const user = (await response.json()) as {
			id: number
			name: string
			username: string
		}

		return user
	})

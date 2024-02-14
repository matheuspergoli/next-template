"use server"

import { z } from "zod"

import { createAction } from "@/libs/action"

const inputSchema = z.object({
	id: z.number()
})

const outputSchema = z.object({
	name: z.string(),
	username: z.string()
})

const middleware = async () => {
	console.log("Logging from action middleware")

	return true
}

const action = createAction({ middleware })

export const serverAction = action
	.input(inputSchema)
	.output(outputSchema)
	.query(async ({ input }) => {
		const response = await fetch(`https://jsonplaceholder.typicode.com/users/${input.id}`)
		const data = (await response.json()) as z.infer<typeof outputSchema>

		return {
			name: data.name,
			username: data.username
		}
	})

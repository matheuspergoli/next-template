import { z } from "zod"

import { actionBuilder } from "@/libs/action"

const inputSchema = z.object({
	id: z.number().min(1).max(10)
})

const outputSchema = z.array(
	z.object({
		id: z.number(),
		name: z.string(),
		username: z.string()
	})
)

const middleware = async () => {
	return true
}

const context = async () => {
	const users = await fetch("https://jsonplaceholder.typicode.com/users")
	const data = await users.json()

	return data as z.infer<typeof outputSchema>
}

const action = actionBuilder.createWithContext({ middleware, context })

export const serverAction = action
	.input(inputSchema)
	.output(outputSchema)
	.execute(async ({ input, ctx }) => {
		const user = ctx.filter((user) => user.id === input.id)

		return user
	})

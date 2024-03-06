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
	const response = await fetch("https://jsonplaceholder.typicode.com/users")
	const users = (await response.json()) as z.infer<typeof outputSchema>

	return { users }
}

const action = actionBuilder({ middleware })

export const serverAction = action
	.input(inputSchema)
	.output(outputSchema)
	.execute(async ({ input, ctx }) => {
		return ctx.users.filter((user) => user.id === input.id)
	})

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

const action = actionBuilder({ middleware })

export const serverAction = action
	.input(inputSchema)
	.output(outputSchema)
	.execute(async ({ input }) => {
		const users = await fetch("https://jsonplaceholder.typicode.com/users")
		const data = (await users.json()) as z.infer<typeof outputSchema>
		return data.filter((user) => user.id === input.id)
	})

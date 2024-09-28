import { z } from "zod"

export const LoginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Invalid password field")
})

export type LoginSchemaData = z.infer<typeof LoginSchema>

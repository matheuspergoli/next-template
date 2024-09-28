import { z } from "zod"

export const RegisterSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(255, "Username must be at most 255 characters"),
	email: z.string().email("Invalid email address"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(255, "Password must be at most 255 characters")
})

export type RegisterSchemaData = z.infer<typeof RegisterSchema>

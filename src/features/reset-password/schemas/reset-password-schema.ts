import { z } from "zod"

export const ResetPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(255, "Password must be at most 255 characters"),
		confirmNewPassword: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(255, "Password must be at most 255 characters")
	})
	.superRefine(({ newPassword, confirmNewPassword }, ctx) => {
		if (newPassword !== confirmNewPassword) {
			ctx.addIssue({
				code: "custom",
				message: "Passwords do not match",
				path: ["confirmNewPassword"]
			})
		}
	})

export type ResetPasswordSchemaData = z.infer<typeof ResetPasswordSchema>

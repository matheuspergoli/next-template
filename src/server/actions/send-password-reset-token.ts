"use server"

import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { env } from "@/environment/env"
import { rateLimitByKey } from "@/libs/limiter"
import { resend } from "@/libs/resend"
import { getBaseUrl } from "@/libs/utils"
import { PasswordResetEmail } from "@/shared/emails/reset-password"

import { users } from "../db/schema"
import { publicAction } from "../root"
import { createPasswordResetToken } from "../services/create-password-reset-token"

export const sendPasswordResetToken = publicAction
	.input(z.object({ email: z.string() }))
	.middleware(async ({ input }) => {
		await rateLimitByKey({ key: input.email, window: 60000, limit: 3 })
	})
	.execute(async ({ input, ctx }) => {
		const user = await ctx.db.query.users.findFirst({
			where: eq(users.email, input.email)
		})

		if (!user?.id) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Invalid email address"
			})
		}

		const { data: verificationToken } = await createPasswordResetToken({
			userId: user.id
		})

		if (!verificationToken) {
			throw new ActionError({
				code: "INTERNAL_ERROR",
				message: "Failed to create verification token"
			})
		}

		const verificationLink = `${getBaseUrl()}/reset-password?token=${verificationToken}`

		const { error } = await resend.emails.send({
			from: env.RESEND_DOMAIN,
			to: input.email,
			subject: "Password Reset",
			react: PasswordResetEmail({
				verificationLink,
				username: user.username
			})
		})

		if (error) {
			throw new ActionError({
				code: "INTERNAL_ERROR",
				message: "Failed to send email"
			})
		}
	})

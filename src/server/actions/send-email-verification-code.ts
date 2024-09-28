"use server"

import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { env } from "@/environment/env"
import { rateLimitByKey } from "@/libs/limiter"
import { resend } from "@/libs/resend"
import EmailVerification from "@/shared/emails/email-verification"

import { users } from "../db/schema"
import { publicAction } from "../root"
import { createEmailVerificationCode } from "../services/create-email-verification-code"

export const sendEmailVerificationCode = publicAction
	.input(z.object({ email: z.string() }))
	.middleware(async ({ input }) => {
		await rateLimitByKey({ key: input.email, window: 60000, limit: 1 })
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

		const { data: verificationCode } = await createEmailVerificationCode({
			userId: user.id,
			email: input.email
		})

		if (!verificationCode) {
			throw new ActionError({
				code: "INTERNAL_ERROR",
				message: "Failed to create verification token"
			})
		}

		const { error } = await resend.emails.send({
			from: env.RESEND_DOMAIN,
			to: input.email,
			subject: "Email Verification",
			react: EmailVerification({
				verificationCode,
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

"use server"

import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { env } from "@/environment/env"
import { RefillingTokenBucket } from "@/libs/rate-limit"
import { resend } from "@/libs/resend"
import EmailVerification from "@/shared/emails/email-verification"

import { users } from "../db/schema"
import { globalPOSTRateLimitMiddleware, publicAction } from "../root"
import { createEmailVerificationCode } from "../services/create-email-verification-code"

const ipBucket = new RefillingTokenBucket<string>(3, 60 * 60) // 3 requests per hour
const userIdBucket = new RefillingTokenBucket<string>(3, 60 * 60) // 1 request per hour

export const sendEmailVerificationCode = publicAction
	.input(z.object({ email: z.string() }))
	.middleware(globalPOSTRateLimitMiddleware)
	.middleware(async ({ ctx }) => {
		if (!ipBucket.check(ctx.clientIP, 1)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
			})
		}
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

		if (user.emailVerified) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Email already verified"
			})
		}

		if (!ipBucket.consume(ctx.clientIP, 1)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
			})
		}

		if (!userIdBucket.consume(user.id, 1)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
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

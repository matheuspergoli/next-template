"use server"

import { sha256 } from "@oslojs/crypto/sha2"
import { encodeHexLowerCase } from "@oslojs/encoding"
import { genSalt, hash } from "bcryptjs"
import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { deleteSessionTokenCookie, invalidateUserSessions, setSession } from "@/libs/auth"
import { checkPasswordLeaks, checkPasswordStrength } from "@/libs/password"
import { Throttler } from "@/libs/rate-limit"
import { isWithinExpirationDate } from "@/libs/time-span"

import { passwordResetTokens, users } from "../db/schema"
import { globalPOSTRateLimitMiddleware, publicAction } from "../root"

const throttler = new Throttler<string>([20, 35, 60, 120, 180, 240, 360, 480, 660])

export const resetPassword = publicAction
	.input(
		z.object({
			password: z.string().min(6).max(255),
			verificationToken: z.string()
		})
	)
	.middleware(globalPOSTRateLimitMiddleware)
	.middleware(async ({ ctx }) => {
		if (!throttler.consume(ctx.clientIP)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
			})
		}
	})
	.execute(async ({ input, ctx }) => {
		const passwordFeedbackWarning = checkPasswordStrength(input.password).feedback.warning

		if (passwordFeedbackWarning) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: passwordFeedbackWarning
			})
		}

		const checkForPasswordLeaks = await checkPasswordLeaks(input.password)

		if (checkForPasswordLeaks) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "This password has been leaked in a data breach"
			})
		}

		const tokenHash = encodeHexLowerCase(
			sha256(new TextEncoder().encode(input.verificationToken))
		)

		const token = await ctx.db.query.passwordResetTokens.findFirst({
			where: eq(passwordResetTokens.tokenHash, tokenHash)
		})

		if (!token || !isWithinExpirationDate(token.expiresAt)) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Invalid verification token"
			})
		}

		if (!throttler.consume(token?.userId)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
			})
		}

		await invalidateUserSessions({ userId: token.userId })
		deleteSessionTokenCookie()

		const salt = await genSalt(10)
		const hashedPassword = await hash(input.password, salt)

		await ctx.db.update(users).set({
			passwordHash: hashedPassword
		})

		throttler.reset(token.userId)

		await setSession({ userId: token.userId })
	})

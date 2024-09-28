"use server"

import { genSalt, hash } from "bcryptjs"
import { eq } from "drizzle-orm"
import { isWithinExpirationDate } from "oslo"
import { sha256 } from "oslo/crypto"
import { encodeHex } from "oslo/encoding"
import { ActionError } from "safe-action"
import { z } from "zod"

import { lucia } from "@/libs/auth"
import { rateLimitByIp } from "@/libs/limiter"
import { checkPasswordLeaks, checkPasswordStrength } from "@/libs/password"
import { setSession } from "@/libs/session"

import { passwordResetTokens, users } from "../db/schema"
import { publicAction } from "../root"

export const resetPassword = publicAction
	.input(
		z.object({
			password: z.string().min(6).max(255),
			verificationToken: z.string()
		})
	)
	.middleware(async () => {
		await rateLimitByIp({ limit: 3, window: 120000 })
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

		const tokenHash = encodeHex(
			await sha256(new TextEncoder().encode(input.verificationToken))
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

		await lucia.invalidateUserSessions(token.userId)

		const salt = await genSalt(10)
		const hashedPassword = await hash(input.password, salt)

		await ctx.db.update(users).set({
			passwordHash: hashedPassword
		})

		await setSession({ userId: token.userId })
	})

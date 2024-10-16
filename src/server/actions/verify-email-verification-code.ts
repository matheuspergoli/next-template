"use server"

import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { deleteSessionTokenCookie, invalidateUserSessions, setSession } from "@/libs/auth"
import { ExpiringTokenBucket } from "@/libs/rate-limit"
import { isWithinExpirationDate } from "@/libs/time-span"

import { emailVerificationCodes, users } from "../db/schema"
import { authedAction, globalPOSTRateLimitMiddleware } from "../root"

const bucket = new ExpiringTokenBucket<string>(5, 60 * 30) // 5 requests per 30 minutes

export const verifyEmailVerificationCode = authedAction
	.input(
		z.object({
			code: z.string()
		})
	)
	.middleware(globalPOSTRateLimitMiddleware)
	.middleware(async ({ ctx }) => {
		if (!bucket.check(ctx.user.id, 1)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
			})
		}
	})
	.execute(async ({ input, ctx }) => {
		const databaseCode = await ctx.db.query.emailVerificationCodes.findFirst({
			where: eq(emailVerificationCodes.userId, ctx.user.id)
		})

		if (!databaseCode || databaseCode.code !== input.code) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Invalid verification code"
			})
		}

		if (!isWithinExpirationDate(databaseCode.expiresAt)) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Verification code has expired"
			})
		}

		if (databaseCode.email !== ctx.user.email) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Invalid email address"
			})
		}

		if (!bucket.consume(ctx.user.id, 1)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
			})
		}

		await ctx.db
			.delete(emailVerificationCodes)
			.where(eq(emailVerificationCodes.id, databaseCode.id))

		await invalidateUserSessions({ userId: ctx.user.id })
		deleteSessionTokenCookie()

		await ctx.db
			.update(users)
			.set({ emailVerified: true })
			.where(eq(users.id, ctx.user.id))

		await setSession({ userId: ctx.user.id })
	})

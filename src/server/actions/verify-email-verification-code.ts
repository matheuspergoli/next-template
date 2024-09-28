"use server"

import { eq } from "drizzle-orm"
import { isWithinExpirationDate } from "oslo"
import { ActionError } from "safe-action"
import { z } from "zod"

import { lucia } from "@/libs/auth"
import { setSession } from "@/libs/session"

import { emailVerificationCodes, users } from "../db/schema"
import { authedAction } from "../root"

export const verifyEmailVerificationCode = authedAction
	.input(
		z.object({
			code: z.string()
		})
	)
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

		await ctx.db
			.delete(emailVerificationCodes)
			.where(eq(emailVerificationCodes.id, databaseCode.id))

		await lucia.invalidateUserSessions(ctx.user.id)
		await ctx.db
			.update(users)
			.set({ emailVerified: true })
			.where(eq(users.id, ctx.user.id))

		await setSession({ userId: ctx.user.id })
	})

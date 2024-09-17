"use server"

import { genSalt, hash } from "bcryptjs"
import { eq } from "drizzle-orm"
import { generateIdFromEntropySize } from "lucia"
import { ActionError } from "safe-action"
import { z } from "zod"

import { rateLimitByKey } from "@/libs/limiter"
import { checkPasswordLeaks, checkPasswordStrength } from "@/libs/password"
import { setSession } from "@/libs/session"

import { users } from "../db/schema"
import { publicAction } from "../root"

export const signupWithEmailAndPassword = publicAction
	.input(
		z.object({
			username: z.string().min(3).max(31),
			email: z.string().email(),
			password: z.string().min(6).max(255)
		})
	)
	.middleware(async ({ input }) => {
		await rateLimitByKey({ key: input.email, window: 30000, limit: 5 })
	})
	.execute(async ({ ctx, input }) => {
		const existingUser = await ctx.db.query.users.findFirst({
			where: eq(users.email, input.email)
		})

		if (existingUser) {
			throw new ActionError({
				code: "CONFLICT",
				message: "Signup failed. Check your information or try another email address."
			})
		}

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

		const userId = generateIdFromEntropySize(10)
		const salt = await genSalt(10)
		const hashedPassword = await hash(input.password, salt)

		const user = await ctx.db
			.insert(users)
			.values({
				id: userId,
				username: input.username,
				email: input.email,
				passwordHash: hashedPassword,
				emailVerified: false
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!user) {
			throw new ActionError({
				code: "ERROR",
				message: "Failed to create user"
			})
		}

		await setSession({ userId })
	})

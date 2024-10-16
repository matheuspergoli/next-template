"use server"

import { ActionError } from "safe-action"
import { z } from "zod"

import { ExpiringTokenBucket } from "@/libs/rate-limit"
import { generateRandomId } from "@/libs/utils"

import { oauthAccounts, users } from "../db/schema"
import { globalPOSTRateLimitMiddleware, publicAction } from "../root"

const ipBucket = new ExpiringTokenBucket<string>(3, 60 * 60) // 3 requests per hour

export const createUserViaGoogle = publicAction
	.input(
		z.object({
			googleId: z.string(),
			username: z.string(),
			email: z.string().email()
		})
	)
	.middleware(globalPOSTRateLimitMiddleware)
	.middleware(async ({ ctx }) => {
		if (!ipBucket.check(ctx.clientIP, 1)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
			})
		}
	})
	.execute(async ({ ctx, input }) => {
		const id = generateRandomId() // 32 characters

		const newUser = await ctx.db
			.insert(users)
			.values({
				id,
				username: input.username,
				email: input.email,
				emailVerified: true
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!newUser) {
			throw new ActionError({
				code: "INTERNAL_ERROR",
				message: "Failed to create user via google"
			})
		}

		const newOauthAccount = await ctx.db
			.insert(oauthAccounts)
			.values({
				providerId: "google",
				providerUserId: input.googleId,
				userId: id
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!newOauthAccount) {
			throw new ActionError({
				code: "INTERNAL_ERROR",
				message: "Failed to create google oauth account"
			})
		}

		if (!ipBucket.consume(ctx.clientIP, 1)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
			})
		}

		return newUser
	})

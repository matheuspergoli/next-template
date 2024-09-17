"use server"

import { generateIdFromEntropySize } from "lucia"
import { ActionError } from "safe-action"
import { z } from "zod"

import { oauthAccount, users } from "../db/schema"
import { publicAction } from "../root"

export const createUserViaGoogle = publicAction
	.input(
		z.object({
			googleId: z.string(),
			username: z.string(),
			email: z.string().email()
		})
	)
	.execute(async ({ ctx, input }) => {
		const id = generateIdFromEntropySize(10)

		const user = await ctx.db.transaction(async (tx) => {
			const newUser = await tx
				.insert(users)
				.values({
					id,
					username: input.username,
					email: input.email,
					emailVerified: false
				})
				.returning()
				.then((res) => res[0] ?? null)

			if (!newUser) {
				tx.rollback()
				throw new ActionError({
					code: "INTERNAL_ERROR",
					message: "Failed to create user"
				})
			}

			const newOauthAccount = await tx
				.insert(oauthAccount)
				.values({
					providerId: "google",
					providerUserId: input.googleId,
					userId: id
				})
				.returning()
				.then((res) => res[0] ?? null)

			if (!newOauthAccount) {
				tx.rollback()
				throw new ActionError({
					code: "INTERNAL_ERROR",
					message: "Failed to create oauth account"
				})
			}

			return newUser
		})

		return user
	})

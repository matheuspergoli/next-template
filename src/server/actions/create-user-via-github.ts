"use server"

import { generateIdFromEntropySize } from "lucia"
import { ActionError } from "safe-action"
import { z } from "zod"

import { oauthAccounts, users } from "../db/schema"
import { publicAction } from "../root"

export const createUserViaGithub = publicAction
	.input(
		z.object({
			githubId: z.number(),
			username: z.string(),
			email: z.string().email()
		})
	)
	.execute(async ({ ctx, input }) => {
		const id = generateIdFromEntropySize(10)

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
				message: "Failed to create user via github"
			})
		}

		const newOauthAccount = await ctx.db
			.insert(oauthAccounts)
			.values({
				providerId: "github",
				providerUserId: input.githubId.toString(),
				userId: id
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!newOauthAccount) {
			throw new ActionError({
				code: "INTERNAL_ERROR",
				message: "Failed to create github oauth account"
			})
		}

		return newUser
	})

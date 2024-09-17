"use server"

import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { oauthAccount, users } from "../db/schema"
import { publicAction } from "../root"

export const getUserByGithubId = publicAction
	.input(z.object({ githubId: z.string() }))
	.execute(async ({ ctx, input }) => {
		const user = await ctx.db
			.select({
				id: users.id,
				username: users.username,
				email: users.email,
				emailVerified: users.emailVerified
			})
			.from(users)
			.innerJoin(oauthAccount, eq(users.id, oauthAccount.userId))
			.where(eq(oauthAccount.providerUserId, input.githubId))
			.limit(1)
			.then((res) => res[0] ?? null)

		if (!user) {
			throw new ActionError({
				code: "NOT_FOUND",
				message: "User not found"
			})
		}

		return user
	})

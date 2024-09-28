"use server"

import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { oauthAccounts, users } from "../db/schema"
import { publicAction } from "../root"

export const getUserByGoogleId = publicAction
	.input(z.object({ googleId: z.string() }))
	.execute(async ({ ctx, input }) => {
		const user = await ctx.db
			.select({
				id: users.id,
				username: users.username,
				email: users.email,
				emailVerified: users.emailVerified
			})
			.from(users)
			.innerJoin(oauthAccounts, eq(users.id, oauthAccounts.userId))
			.where(eq(oauthAccounts.providerUserId, input.googleId))
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

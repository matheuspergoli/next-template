"use server"

import { compare } from "bcryptjs"
import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { rateLimitByKey } from "@/libs/limiter"
import { setSession } from "@/libs/session"

import { users } from "../db/schema"
import { publicAction } from "../root"

export const loginWithEmailAndPassword = publicAction
	.input(
		z.object({
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

		if (!existingUser || !existingUser.passwordHash) {
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Incorrect username or password"
			})
		}

		const validPassword = await compare(input.password, existingUser.passwordHash)

		if (!validPassword) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Incorrect username or password"
			})
		}

		await setSession({ userId: existingUser.id })
	})

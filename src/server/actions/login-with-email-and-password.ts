"use server"

import { compare } from "bcryptjs"
import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { setSession } from "@/libs/auth"
import { Throttler } from "@/libs/rate-limit"

import { users } from "../db/schema"
import { globalPOSTRateLimitMiddleware, publicAction } from "../root"

const throttler = new Throttler<string>([20, 35, 60, 120, 180, 240, 360, 480, 660])

export const loginWithEmailAndPassword = publicAction
	.input(
		z.object({
			email: z.string().email(),
			password: z.string().min(6).max(255)
		})
	)
	.middleware(globalPOSTRateLimitMiddleware)
	.middleware(async ({ ctx }) => {
		if (!throttler.consume(ctx.clientIP)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
			})
		}
	})
	.execute(async ({ ctx, input }) => {
		const existingUser = await ctx.db.query.users.findFirst({
			where: eq(users.email, input.email)
		})

		if (!existingUser || !existingUser.passwordHash) {
			throw new ActionError({
				code: "NOT_FOUND",
				message: "Incorrect email or password"
			})
		}

		if (!throttler.consume(existingUser.id)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Too many requests"
			})
		}

		const validPassword = await compare(input.password, existingUser.passwordHash)

		if (!validPassword) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Incorrect email or password"
			})
		}

		throttler.reset(existingUser.id)

		await setSession({ userId: existingUser.id })
	})

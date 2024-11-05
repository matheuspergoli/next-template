"use server"

import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { setSession } from "@/libs/auth"
import { checkPasswordLeaks, checkPasswordStrength, hashPassword } from "@/libs/password"

import { usersTable } from "../db/schema"
import { publicAction } from "../root"

export const signup = publicAction
	.input(
		z.object({
			email: z.string().email(),
			password: z.string().min(6).max(255)
		})
	)
	.execute(async ({ ctx, input }) => {
		const existingUser = await ctx.db.query.usersTable.findFirst({
			where: eq(usersTable.email, input.email)
		})

		if (existingUser) {
			throw new ActionError({
				code: "CONFLICT",
				message: "Signup failed. Check your credentials or try another email address."
			})
		}

		const { feedback } = checkPasswordStrength(input.password)

		if (feedback.warning) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: feedback.warning
			})
		}

		const checkForPasswordLeaks = await checkPasswordLeaks(input.password)

		if (checkForPasswordLeaks) {
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "This password has been leaked in a data breach"
			})
		}

		const hashedPassword = await hashPassword(input.password)

		const user = await ctx.db
			.insert(usersTable)
			.values({
				email: input.email,
				passwordHash: hashedPassword
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!user) {
			throw new ActionError({
				code: "INTERNAL_ERROR",
				message: "Failed to create user"
			})
		}

		await setSession({ userId: user.id })
	})

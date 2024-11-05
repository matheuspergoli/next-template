"use server"

import { eq } from "drizzle-orm"
import { ActionError } from "safe-action"
import { z } from "zod"

import { setSession } from "@/libs/auth"
import { verifyPassword } from "@/libs/password"

import { usersTable } from "../db/schema"
import { publicAction } from "../root"

export const login = publicAction
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

		if (!existingUser || !existingUser.passwordHash) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Incorrect email or password"
			})
		}

		const validPassword = await verifyPassword(input.password, existingUser.passwordHash)

		if (!validPassword) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "Incorrect email or password"
			})
		}

		await setSession({ userId: existingUser.id })
	})

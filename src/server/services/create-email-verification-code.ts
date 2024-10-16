import "server-only"

import { eq } from "drizzle-orm"
import { z } from "zod"

import { createDate, TimeSpan } from "@/libs/time-span"
import { generateRandomId, generateRandomOTP } from "@/libs/utils"

import { emailVerificationCodes } from "../db/schema"
import { publicAction } from "../root"

export const createEmailVerificationCode = publicAction
	.input(
		z.object({
			userId: z.string(),
			email: z.string()
		})
	)
	.execute(async ({ input, ctx }) => {
		await ctx.db
			.delete(emailVerificationCodes)
			.where(eq(emailVerificationCodes.userId, input.userId))

		const code = generateRandomOTP() // 10 characters

		const id = generateRandomId() // 32 characters

		const expiresAt = createDate(new TimeSpan(15, "m")) // 15 minutes

		await ctx.db.insert(emailVerificationCodes).values({
			id,
			code,
			expiresAt,
			email: input.email,
			userId: input.userId
		})

		return code
	})

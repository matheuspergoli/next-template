import "server-only"

import { eq } from "drizzle-orm"
import { generateIdFromEntropySize } from "lucia"
import { createDate, TimeSpan } from "oslo"
import { alphabet, generateRandomString } from "oslo/crypto"
import { z } from "zod"

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

		const code = generateRandomString(8, alphabet("0-9", "A-Z"))
		const id = generateIdFromEntropySize(10)

		await ctx.db.insert(emailVerificationCodes).values({
			id,
			code,
			userId: input.userId,
			email: input.email,
			expiresAt: createDate(new TimeSpan(15, "m"))
		})

		return code
	})

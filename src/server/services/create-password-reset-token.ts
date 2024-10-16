import "server-only"

import { sha256 } from "@oslojs/crypto/sha2"
import { encodeHexLowerCase } from "@oslojs/encoding"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { createDate, TimeSpan } from "@/libs/time-span"
import { generateRandomOTP } from "@/libs/utils"

import { passwordResetTokens } from "../db/schema"
import { publicAction } from "../root"

export const createPasswordResetToken = publicAction
	.input(z.object({ userId: z.string() }))
	.execute(async ({ input, ctx }) => {
		await ctx.db
			.delete(passwordResetTokens)
			.where(eq(passwordResetTokens.userId, input.userId))

		const tokenId = generateRandomOTP() // 10 characters

		const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(tokenId))) // 64 characters

		const expiresAt = createDate(new TimeSpan(30, "m")) // 30 minutes

		await ctx.db.insert(passwordResetTokens).values({
			tokenHash,
			expiresAt,
			userId: input.userId
		})

		return tokenId
	})

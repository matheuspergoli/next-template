import "server-only"

import { generateIdFromEntropySize } from "lucia"
import { createDate, TimeSpan } from "oslo"
import { sha256 } from "oslo/crypto"
import { encodeHex } from "oslo/encoding"
import { z } from "zod"

import { passwordResetTokens } from "../db/schema"
import { publicAction } from "../root"

export const createPasswordResetToken = publicAction
	.input(z.object({ userId: z.string() }))
	.execute(async ({ input, ctx }) => {
		await ctx.db.delete(passwordResetTokens)
		const tokenId = generateIdFromEntropySize(25)
		const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)))
		await ctx.db.insert(passwordResetTokens).values({
			tokenHash,
			userId: input.userId,
			expiresAt: createDate(new TimeSpan(2, "h"))
		})

		return tokenId
	})

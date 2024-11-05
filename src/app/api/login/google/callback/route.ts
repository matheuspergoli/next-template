import { cookies } from "next/headers"

import { OAuth2RequestError } from "arctic"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { google, setSession } from "@/libs/auth"
import { getIpFromRequest } from "@/libs/get-ip"
import { db } from "@/server/db/client"
import { oauthAccountsTable, usersTable } from "@/server/db/schema"

const GoogleUser = z.object({
	sub: z.string(),
	name: z.string(),
	email: z.string().email()
})

export async function GET(request: Request): Promise<Response> {
	const clientIP = getIpFromRequest(request)

	if (!clientIP) {
		return new Response("Could not get client IP", {
			status: 403
		})
	}

	const coks = await cookies()
	const url = new URL(request.url)
	const code = url.searchParams.get("code")
	const state = url.searchParams.get("state")
	const storedState = coks.get("google_oauth_state")?.value ?? null
	const codeVerifier = coks.get("google_code_verifier")?.value ?? null

	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		return new Response(null, {
			status: 400
		})
	}

	try {
		const oauthUrl = "https://openidconnect.googleapis.com/v1/userinfo"
		const tokens = await google.validateAuthorizationCode(code, codeVerifier)
		const googleUserResponse = await fetch(oauthUrl, {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		})

		const googleUserUnparsed = await googleUserResponse.json()
		const googleUserParsed = GoogleUser.safeParse(googleUserUnparsed)

		if (!googleUserParsed.success) {
			return new Response(null, {
				status: 400,
				statusText: "Bad Request"
			})
		}

		const googleUser = googleUserParsed.data

		const existingGoogleUser = await db
			.select({
				id: usersTable.id,
				username: usersTable.username,
				email: usersTable.email
			})
			.from(usersTable)
			.innerJoin(oauthAccountsTable, eq(usersTable.id, oauthAccountsTable.userId))
			.where(eq(oauthAccountsTable.providerUserId, googleUser.sub))
			.limit(1)
			.then((res) => res[0] ?? null)

		if (existingGoogleUser) {
			await setSession({ userId: existingGoogleUser.id })
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/"
				}
			})
		}

		const newGoogleUser = await db
			.insert(usersTable)
			.values({
				email: googleUser.email,
				username: googleUser.name
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!newGoogleUser) {
			return new Response(null, {
				status: 500,
				statusText: "Error creating google user"
			})
		}

		const newOauthAccount = await db
			.insert(oauthAccountsTable)
			.values({
				userId: newGoogleUser.id,
				providerId: "google",
				providerUserId: googleUser.sub
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!newOauthAccount) {
			return new Response(null, {
				status: 500,
				statusText: "Error creating google oauth account"
			})
		}

		await setSession({ userId: newGoogleUser.id })

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		})
	} catch (error) {
		if (error instanceof OAuth2RequestError) {
			return new Response(null, {
				status: 400
			})
		}

		return new Response(null, {
			status: 500
		})
	}
}

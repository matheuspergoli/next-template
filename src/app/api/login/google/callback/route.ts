import { cookies } from "next/headers"

import { OAuth2RequestError } from "arctic"
import { z } from "zod"

import { google, setSession } from "@/libs/auth"
import { getIpFromRequest } from "@/libs/get-ip"
import { globalGETRateLimit } from "@/libs/rate-limit"
import { createUserViaGoogle } from "@/server/actions/create-user-via-google"
import { getUserByGoogleId } from "@/server/actions/get-user-by-google-id"

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

	if (!globalGETRateLimit({ clientIP })) {
		return new Response("Too many requests", {
			status: 429
		})
	}

	const url = new URL(request.url)
	const code = url.searchParams.get("code")
	const state = url.searchParams.get("state")
	const storedState = cookies().get("google_oauth_state")?.value ?? null
	const codeVerifier = cookies().get("google_code_verifier")?.value ?? null

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

		const { data: existingGoogleUser } = await getUserByGoogleId({
			googleId: googleUser.sub
		})

		if (existingGoogleUser) {
			await setSession({ userId: existingGoogleUser.id })
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/"
				}
			})
		}

		const { data: newGoogleUser } = await createUserViaGoogle({
			email: googleUser.email,
			username: googleUser.name,
			googleId: googleUser.sub
		})

		if (!newGoogleUser) {
			return new Response(null, {
				status: 400
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

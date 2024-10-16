import { cookies } from "next/headers"

import { generateCodeVerifier, generateState } from "arctic"

import { google } from "@/libs/auth"
import { getIpFromRequest } from "@/libs/get-ip"
import { globalGETRateLimit } from "@/libs/rate-limit"

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

	const state = generateState()
	const codeVerifier = generateCodeVerifier()
	const url = await google.createAuthorizationURL(state, codeVerifier, {
		scopes: ["profile", "email"]
	})

	cookies().set("google_oauth_state", state, {
		secure: true,
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10
	})

	cookies().set("google_code_verifier", codeVerifier, {
		secure: true,
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10
	})

	return Response.redirect(url)
}

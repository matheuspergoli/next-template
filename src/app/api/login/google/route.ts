import { cookies } from "next/headers"

import { generateCodeVerifier, generateState } from "arctic"

import { google } from "@/libs/auth"
import { getIpFromRequest } from "@/libs/get-ip"

export async function GET(request: Request): Promise<Response> {
	const clientIP = getIpFromRequest(request)

	if (!clientIP) {
		return new Response("Could not get client IP", {
			status: 403
		})
	}

	const coks = await cookies()
	const state = generateState()
	const codeVerifier = generateCodeVerifier()
	const url = google.createAuthorizationURL(state, codeVerifier, ["profile", "email"])

	coks.set("google_oauth_state", state, {
		secure: true,
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	})

	coks.set("google_code_verifier", codeVerifier, {
		secure: true,
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	})

	return Response.redirect(url)
}

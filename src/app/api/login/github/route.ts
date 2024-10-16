import { cookies } from "next/headers"

import { generateState } from "arctic"

import { github } from "@/libs/auth"
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
	const url = await github.createAuthorizationURL(state, {
		scopes: ["user:email"]
	})

	cookies().set("github_oauth_state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	})

	return Response.redirect(url)
}

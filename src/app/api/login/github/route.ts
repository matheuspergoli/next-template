import { cookies } from "next/headers"

import { generateState } from "arctic"

import { getIpFromRequest } from "@/libs/get-ip"
import { github } from "@/server/services/oauth"

export async function GET(request: Request): Promise<Response> {
	const clientIP = getIpFromRequest(request)

	if (!clientIP) {
		return new Response("Could not get client IP", {
			status: 403
		})
	}

	const coks = await cookies()
	const state = generateState()
	const url = github.createAuthorizationURL(state, ["user:email"])

	coks.set("github_oauth_state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	})

	return Response.redirect(url)
}

import { cookies } from "next/headers"

import { OAuth2RequestError } from "arctic"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { getIpFromRequest } from "@/libs/get-ip"
import { github } from "@/libs/oauth"
import { setSession } from "@/libs/session"
import { db } from "@/server/db/client"
import { oauthAccountsTable, usersTable } from "@/server/db/schema"

const GithubUser = z.object({
	id: z.number(),
	login: z.string(),
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
	const storedState = coks.get("github_oauth_state")?.value ?? null

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		})
	}

	try {
		const oauthUrl = "https://api.github.com/user"
		const tokens = await github.validateAuthorizationCode(code)
		const githubUserResponse = await fetch(oauthUrl, {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		})

		const githubUserUnparsed = await githubUserResponse.json()
		const githubUserParsed = GithubUser.safeParse(githubUserUnparsed)

		if (!githubUserParsed.success) {
			return new Response(null, {
				status: 400,
				statusText: "Bad Request"
			})
		}

		const githubUser = githubUserParsed.data

		const existingGithubUser = await db
			.select({
				id: usersTable.id,
				username: usersTable.username,
				email: usersTable.email
			})
			.from(usersTable)
			.innerJoin(oauthAccountsTable, eq(usersTable.id, oauthAccountsTable.userId))
			.where(eq(oauthAccountsTable.providerUserId, githubUser.id.toString()))
			.limit(1)
			.then((res) => res[0] ?? null)

		if (existingGithubUser) {
			await setSession({ userId: existingGithubUser.id })
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/"
				}
			})
		}

		const newGithubUser = await db
			.insert(usersTable)
			.values({
				email: githubUser.email,
				username: githubUser.login
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!newGithubUser) {
			return new Response(null, {
				status: 500,
				statusText: "Error creating github user"
			})
		}

		const newOauthAccount = await db
			.insert(oauthAccountsTable)
			.values({
				providerId: "github",
				providerUserId: githubUser.id.toString(),
				userId: newGithubUser.id
			})
			.returning()
			.then((res) => res[0] ?? null)

		if (!newOauthAccount) {
			return new Response(null, {
				status: 500,
				statusText: "Error creating github oauth account"
			})
		}

		await setSession({ userId: newGithubUser.id })

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		})
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			return new Response(null, {
				status: 400
			})
		}

		return new Response(null, {
			status: 500
		})
	}
}

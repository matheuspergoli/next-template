import { cookies } from "next/headers"

import { OAuth2RequestError } from "arctic"
import { z } from "zod"

import { APP_CONFIG } from "@/libs/app-config"
import { github } from "@/libs/auth"
import { setSession } from "@/libs/session"
import { createUserViaGithub } from "@/server/actions/create-user-via-github"
import { getUserByGithubId } from "@/server/actions/get-user-by-github-id"

const GithubUser = z.object({
	id: z.number(),
	login: z.string(),
	avatar_url: z.string(),
	email: z.string().email()
})

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const code = url.searchParams.get("code")
	const state = url.searchParams.get("state")
	const storedState = cookies().get("github_oauth_state")?.value ?? null

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
				Authorization: `Bearer ${tokens.accessToken}`
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

		const { data: existingGithubUser } = await getUserByGithubId({
			githubId: githubUser.id.toString()
		})

		if (existingGithubUser) {
			await setSession({ userId: existingGithubUser.id })
			return new Response(null, {
				status: 302,
				headers: {
					Location: APP_CONFIG.afterLoginUrl
				}
			})
		}

		const { data: newGithubUser } = await createUserViaGithub({
			username: githubUser.login,
			email: githubUser.email,
			githubId: Number(githubUser.id)
		})

		if (!newGithubUser) {
			return new Response(null, {
				status: 400
			})
		}

		await setSession({ userId: newGithubUser.id })

		return new Response(null, {
			status: 302,
			headers: {
				Location: APP_CONFIG.afterLoginUrl
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

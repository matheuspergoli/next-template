import { GitHub, Google } from "arctic"

import { env } from "@/environment/env"

import { getBaseUrl } from "./utils"

export const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, null)

export const google = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	`${getBaseUrl()}/api/login/google/callback`
)

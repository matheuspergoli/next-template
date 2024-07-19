import { headers } from "next/headers"

import { ActionError } from "safe-action"

export const getIp = () => {
	const forwardedFor = headers().get("x-forwarded-for")
	const realIp = headers().get("x-real-ip")

	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim()
	}

	if (realIp) {
		return realIp.trim()
	}

	return null
}

const PRUNE_INTERVAL = 60 * 1000

const trackers: Record<
	string,
	{
		count: number
		expiresAt: number
	}
> = {}

const pruneTrackers = () => {
	const now = Date.now()
	const newTrackers: typeof trackers = {}

	for (const key in trackers) {
		const tracker = trackers[key]

		if (tracker && tracker.expiresAt >= now) {
			newTrackers[key] = tracker
		}
	}

	Object.assign(trackers, newTrackers)
}

setInterval(pruneTrackers, PRUNE_INTERVAL)

export const rateLimitByKey = async ({
	key = "global",
	limit = 1,
	window = 10000
}: {
	key: string
	limit: number
	window: number
}) => {
	const tracker = trackers[key] || { count: 0, expiresAt: 0 }

	if (!trackers[key]) {
		trackers[key] = tracker
	}

	if (tracker.expiresAt < Date.now()) {
		tracker.count = 0
		tracker.expiresAt = Date.now() + window
	}

	tracker.count++

	if (tracker.count > limit) {
		throw new ActionError({
			code: "UNAUTHORIZED",
			message: `Try again in ${Math.ceil((tracker.expiresAt - Date.now()) / 1000)} seconds`
		})
	}
}

export const rateLimitByIp = async ({
	key = "global",
	limit = 1,
	window = 10000
}: {
	key: string
	limit: number
	window: number
}) => {
	const ip = getIp()

	if (!ip) {
		throw new ActionError({
			code: "UNAUTHORIZED",
			message: "You are not authorized to perform this action"
		})
	}

	await rateLimitByKey({
		key: `${ip}-${key}`,
		limit,
		window
	})
}

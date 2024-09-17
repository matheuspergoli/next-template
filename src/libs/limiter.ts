import { getIp } from "@/libs/get-ip"

const PRUNE_INTERVAL = 60 * 1000 // 1 minute

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

export async function rateLimitByKey({
	key = "global",
	limit = 1,
	window = 10000
}: {
	key?: string
	limit?: number
	window?: number
}) {
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
		throw new Error(
			`Try again in ${Math.ceil((tracker.expiresAt - Date.now()) / 1000)} seconds`
		)
	}
}

export async function rateLimitByIp({
	key = "global",
	limit = 1,
	window = 10000
}: {
	key?: string
	limit?: number
	window?: number
}) {
	const ip = getIp()

	if (!ip) {
		throw new Error("You are not allowed to perform this action")
	}

	await rateLimitByKey({
		key: `${ip}-${key}`,
		limit,
		window
	})
}

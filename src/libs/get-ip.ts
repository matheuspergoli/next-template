import { headers } from "next/headers"

export const getIp = async () => {
	const heads = await headers()

	const forwardedFor = heads.get("x-forwarded-for")
	const realIp = heads.get("x-real-ip")

	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim()
	}

	if (realIp) {
		return realIp.trim()
	}

	return null
}

export const getIpFromRequest = (request: Request) => {
	const forwardedFor = request.headers.get("x-forwarded-for")
	const realIp = request.headers.get("x-real-ip")

	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim()
	}

	if (realIp) {
		return realIp.trim()
	}

	return null
}

import { NextResponse, type NextRequest } from "next/server"

import { env } from "@/environment/env"
import { TimeSpan } from "@/libs/time-span"

export const CSRFProtectionMiddleware = (request: NextRequest) => {
	if (request.method === "GET") {
		const maxAge = new TimeSpan(30, "d") // 30 days

		const response = NextResponse.next()
		const token = request.cookies.get("session")?.value ?? null

		if (token !== null) {
			response.cookies.set("session", token, {
				path: "/",
				maxAge: maxAge.seconds(),
				sameSite: "lax",
				httpOnly: true,
				secure: env.NODE_ENV === "production"
			})
		}

		return response
	}

	const originHeader = request.headers.get("Origin")
	const hostHeader = request.headers.get("Host")

	if (originHeader === null || hostHeader === null) {
		return new NextResponse(null, {
			status: 403
		})
	}

	let origin: URL

	try {
		origin = new URL(originHeader)
	} catch {
		return new NextResponse(null, {
			status: 403
		})
	}

	if (origin.host !== hostHeader) {
		return new NextResponse(null, {
			status: 403
		})
	}

	return NextResponse.next()
}

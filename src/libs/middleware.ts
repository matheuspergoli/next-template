import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from "next/server"

type Mode = "parallel" | "sequence"
type MiddlewareMap = Record<string, NextMiddleware | NextMiddleware[]>

export const createMiddleware = (mode: Mode, pathMiddlewareMap: MiddlewareMap) => {
	return async function middleware(request: NextRequest, event: NextFetchEvent) {
		const path = request.nextUrl.pathname || "/"
		let response: Response | NextResponse = NextResponse.next()

		for (const [key, middlewares] of Object.entries(pathMiddlewareMap)) {
			if (matchPath(key, path)) {
				const middlewareList = Array.isArray(middlewares) ? middlewares : [middlewares]

				let responses = []
				if (mode !== "parallel" && mode !== "sequence") {
					throw new Error(`Invalid createMiddleware mode: ${mode}`)
				}

				if (mode === "sequence") {
					for (const mw of middlewareList) {
						const res = await mw(request, event)
						responses.push(res)
					}
				}

				if (mode === "parallel") {
					responses = await Promise.all(middlewareList.map((mw) => mw(request, event)))
				}

				const lastNonNullResponse = responses.reverse().find((res) => res != null)

				if (lastNonNullResponse) {
					response = lastNonNullResponse
				}
			}
		}

		return response
	}
}

function matchPath(key: string, path: string) {
	if (Array.isArray(key)) {
		return key.some((pathPattern) => {
			return typeof pathPattern === "string" && path.startsWith(pathPattern)
		})
	}
	if (typeof key === "string" && key.includes("*")) {
		return path.startsWith(key.replace("*", ""))
	}
	return path === key
}

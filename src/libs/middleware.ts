import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from 'next/server'

type MiddlewareMap = {
	[key: string]: NextMiddleware | NextMiddleware[]
}

export const createMiddleware = (pathMiddlewareMap: MiddlewareMap) => {
	return async function middleware(request: NextRequest, event: NextFetchEvent) {
		const path = request.nextUrl.pathname ?? '/'
		let response: Response | NextResponse = NextResponse.next()

		for (const [key, middlewares] of Object.entries(pathMiddlewareMap)) {
			if (matchPath(key, path)) {
				const middlewareList = Array.isArray(middlewares) ? middlewares : [middlewares]

				const responses = await Promise.all(
					middlewareList.map((mw) => mw(request, event))
				)

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
			return typeof pathPattern === 'string' && path.startsWith(pathPattern)
		})
	}
	if (typeof key === 'string' && key.includes('*')) {
		return path.startsWith(key.replace('*', ''))
	}
	return path === key
}

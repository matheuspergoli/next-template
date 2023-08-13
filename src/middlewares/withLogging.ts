import { NextFetchEvent, NextRequest } from 'next/server'

export const withLogging: MiddlewareFactory = (next) => {
	return async (request: NextRequest, _next: NextFetchEvent) => {
		console.log(`[Logging Middleware] Log from [Path] ${request.nextUrl.pathname}`)
		return next(request, _next)
	}
}

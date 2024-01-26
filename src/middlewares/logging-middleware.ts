import { NextRequest } from "next/server"

export const loggingMiddleware = (request: NextRequest) => {
	console.log(`[Logging Middleware] Log from [Path] ${request.nextUrl.pathname}`)
}

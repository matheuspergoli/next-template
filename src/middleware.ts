import { authorizationMiddleware } from '@/features/authorization/authorization-middleware'
import { loggingMiddleware } from '@/features/logging/logging-middleware'
import { rateLimitMiddleware } from '@/features/rate-limit/rate-limit-middleware'
import { createMiddleware } from '@/libs/middleware'

export default createMiddleware({
	'*': [loggingMiddleware, rateLimitMiddleware, authorizationMiddleware]
})

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)']
}

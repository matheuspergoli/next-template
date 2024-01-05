import { authorizationMiddleware } from '@/middlewares/authorization-middleware'
import { loggingMiddleware } from '@/middlewares/logging-middleware'
import { rateLimitMiddleware } from '@/middlewares/rate-limit-middleware'
import { stackMiddleware } from '@/libs/middleware'

export default stackMiddleware([
	loggingMiddleware,
	rateLimitMiddleware,
	authorizationMiddleware
])

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)']
}

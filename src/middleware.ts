import { AuthorizationMiddleware } from '@/middlewares/authorization-middleware'
import { LoggingMiddleware } from '@/middlewares/logging-middleware'
import { RateLimitMiddleware } from '@/middlewares/rate-limit-middleware'
import { StackMiddleware } from '@/middlewares/stack-middleware'

export default StackMiddleware([
	LoggingMiddleware,
	RateLimitMiddleware,
	AuthorizationMiddleware
])

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)']
}

import { StackMiddleware } from '@/middlewares/StackMiddleware'

import { LoggingMiddleware } from '@/middlewares/LoggingMiddleware'
import { AuthorizationMiddleware } from '@/middlewares/AuthorizationMiddleware'

export default StackMiddleware([LoggingMiddleware, AuthorizationMiddleware])

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)']
}

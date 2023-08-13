import { stackMiddleware } from './middlewares/stackMiddleware'

import { withLogging } from './middlewares/withLogging'
import { withAuthorization } from './middlewares/withAuthorization'

export default stackMiddleware([withLogging, withAuthorization])

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

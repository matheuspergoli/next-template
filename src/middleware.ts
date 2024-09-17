import { createMiddleware } from "@/libs/middleware"
import { loggingMiddleware } from "@/middlewares/logging-middleware"

export default createMiddleware("sequence", {
	"*": [loggingMiddleware]
})

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}

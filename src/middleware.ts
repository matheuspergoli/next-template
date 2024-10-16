import { createMiddleware } from "@/libs/middleware"
import { CSRFProtectionMiddleware } from "@/middlewares/csrf-protection-middleware"
import { loggingMiddleware } from "@/middlewares/logging-middleware"

export default createMiddleware("sequence", {
	"*": [loggingMiddleware, CSRFProtectionMiddleware]
})

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}

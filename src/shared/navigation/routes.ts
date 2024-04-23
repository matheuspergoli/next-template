import { createNavigationConfig } from "next-safe-navigation"
import { z } from "zod"

export const { routes } = createNavigationConfig((defineRoute) => ({
	home: defineRoute("/"),
	hello: defineRoute("/hello/[name]", {
		params: z.object({
			name: z.string()
		}),
		search: z.object({
			surname: z.string()
		})
	})
}))

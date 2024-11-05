import { createNavigationConfig } from "next-safe-navigation"

export const { routes, useSafeSearchParams } = createNavigationConfig((defineRoute) => ({
	home: defineRoute("/"),
	loginWithGithub: defineRoute("/api/login/github"),
	loginWithGoogle: defineRoute("/api/login/google")
}))

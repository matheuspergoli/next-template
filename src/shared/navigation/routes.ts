import { createNavigationConfig } from "next-safe-navigation"
import { z } from "zod"

export const { routes, useSafeSearchParams } = createNavigationConfig((defineRoute) => ({
	home: defineRoute("/"),
	login: defineRoute("/login"),
	register: defineRoute("/register"),
	dashboard: defineRoute("/dashboard"),
	dashboardGeneral: defineRoute("/dashboard/general"),
	dashboardSecurity: defineRoute("/dashboard/security"),
	forgotPassword: defineRoute("/forgot-password"),
	loginWithGithub: defineRoute("/api/login/github"),
	loginWithGoogle: defineRoute("/api/login/google"),
	resetPassword: defineRoute("/reset-password", {
		search: z.object({
			token: z.string()
		})
	})
}))

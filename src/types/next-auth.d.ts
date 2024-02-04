import type { DefaultSession } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: DefaultSession["user"] & {
			id: string
			role: string
		}
	}
}

declare module "next-auth/jwt" {
	interface JWT extends DefaultJWT {
		id: string
		role: string
		name: string | null
		email: string | null
		image: string | null
	}
}

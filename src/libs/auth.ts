import { PrismaAdapter } from "@auth/prisma-adapter"
import { getServerSession, type NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

import { env } from "@/environment/env"
import { prisma } from "@/libs/prisma"

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
	providers: [
		GithubProvider({
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		})
	],
	callbacks: {
		async session({ token, session }) {
			if (token) {
				session.user.id = token.id
				session.user.role = token.role
				session.user.name = token.name
				session.user.email = token.email
				session.user.image = token.image
			}

			return session
		},
		async jwt({ token, user }) {
			const dbUser = await prisma.user.findFirst({
				where: {
					email: token.email
				},
				select: {
					id: true,
					role: true,
					name: true,
					email: true,
					image: true
				}
			})

			if (!dbUser) {
				if (user) {
					token.id = user?.id
				}
				return token
			}

			return {
				id: dbUser.id,
				role: dbUser.role,
				name: dbUser.name,
				email: dbUser.email,
				image: dbUser.image
			}
		}
	},
	pages: {
		signIn: "/login"
	},
	session: {
		strategy: "jwt"
	},
	secret: env.NEXTAUTH_SECRET
}

export const getSession = () => {
	return getServerSession(authOptions)
}

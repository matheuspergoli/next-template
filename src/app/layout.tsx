import type { Metadata, Viewport } from "next"

import "../styles/globals.css"

import { ThemeProvider } from "next-themes"

import { getCurrentUser } from "@/libs/session"
import { UserProvider } from "@/shared/providers/user-provider"

export const metadata: Metadata = {
	title: "Next.js 14 App Router Template",
	description: "Created by Matheus Pergoli"
}

export const viewport: Viewport = {
	initialScale: 1,
	width: "device-width"
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	const userPromise = getCurrentUser()

	return (
		<html lang="pt-br" suppressHydrationWarning>
			<body>
				<ThemeProvider>
					<UserProvider userPromise={userPromise}>{children}</UserProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}

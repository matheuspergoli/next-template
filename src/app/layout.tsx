import type { Metadata, Viewport } from "next"

import "../styles/globals.css"

import { getCurrentUser } from "@/libs/session"
import { ThemeProvider } from "@/shared/providers/theme-provider"
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
		<html lang="pt-BR" suppressHydrationWarning>
			<body>
				<ThemeProvider>
					<UserProvider userPromise={userPromise}>{children}</UserProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}

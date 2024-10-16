import type { Metadata, Viewport } from "next"

import "../styles/globals.css"

import { getCurrentUser } from "@/libs/auth"
import { ThemeProvider } from "@/shared/providers/theme-provider"
import { UserProvider } from "@/shared/providers/user-provider"
import { Toaster } from "@/shared/ui/sonner"

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
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider>
					<UserProvider userPromise={userPromise}>
						{children}
						<Toaster />
					</UserProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}

import type { Metadata, Viewport } from "next"

import "../styles/globals.css"

import { ThemeProvider } from "@/shared/providers/theme-provider"
import { TRPCReactProvider } from "@/shared/trpc/client"

export const metadata: Metadata = {
	title: "Next.js 15 App Router Template",
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
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}

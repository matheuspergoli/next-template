import '@/styles/globals.css'

import React from 'react'
import type { Metadata, Viewport } from 'next'

import { Provider } from '@/providers/main-provider'
import { SessionProvider } from '@/providers/session'
import { ThemeProvider } from '@/providers/theme'

export const metadata: Metadata = {
	title: 'Template Next.js 14 App Router',
	description: 'Created by Matheus Pergoli'
}

export const viewport: Viewport = {
	initialScale: 1,
	width: 'device-width'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='pt-BR' suppressHydrationWarning>
			<body>
				<Provider providers={[SessionProvider, ThemeProvider]}>{children}</Provider>
			</body>
		</html>
	)
}

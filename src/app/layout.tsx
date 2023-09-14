import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Provider } from '@provider/provider'

export const metadata: Metadata = {
	title: 'Template NextJS 13 App Router',
	description: 'Created by Matheus Pergoli'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='pt-br' suppressHydrationWarning>
			<body>
				<Provider>{children}</Provider>
			</body>
		</html>
	)
}

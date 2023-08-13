import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Provider } from '@provider/Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Template NextJS 13 App Router',
	description: 'Created by Matheus Pergoli'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='pt-br'>
			<body className={inter.className}>
				<Provider>{children}</Provider>
			</body>
		</html>
	)
}

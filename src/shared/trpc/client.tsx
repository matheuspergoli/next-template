"use client"

import { useState } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import SuperJSON from "superjson"

import { getBaseUrl } from "@/libs/utils"
import { type AppRouter } from "@/server/root"

import { createQueryClient } from "./query-client"

let clientQueryClientSingleton: QueryClient | undefined = undefined
const getQueryClient = () => {
	if (typeof window === "undefined") {
		return createQueryClient()
	}
	return (clientQueryClientSingleton ??= createQueryClient())
}

export const api = createTRPCReact<AppRouter>()

export const TRPCReactProvider = (props: { children: React.ReactNode }) => {
	const queryClient = getQueryClient()

	const [trpcClient] = useState(() => {
		return api.createClient({
			links: [
				loggerLink({
					enabled: (op) => {
						return (
							process.env.NODE_ENV === "development" ||
							(op.direction === "down" && op.result instanceof Error)
						)
					}
				}),
				httpBatchLink({
					transformer: SuperJSON,
					url: getBaseUrl() + "/api/trpc",
					headers: () => {
						const headers = new Headers()
						headers.set("x-trpc-source", "nextjs-react")
						return headers
					}
				})
			]
		})
	})

	return (
		<QueryClientProvider client={queryClient}>
			<api.Provider client={trpcClient} queryClient={queryClient}>
				{props.children}
			</api.Provider>
		</QueryClientProvider>
	)
}

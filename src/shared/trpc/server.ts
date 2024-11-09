import { cache } from "react"
import { headers } from "next/headers"

import { createHydrationHelpers } from "@trpc/react-query/rsc"

import { createCaller, type AppRouter } from "@/server/root"
import { createTRPCContext } from "@/server/trpc"

import { createQueryClient } from "./query-client"

const createContext = cache(async () => {
	const heads = new Headers(await headers())
	heads.set("x-trpc-source", "rsc")

	return createTRPCContext({
		headers: heads
	})
})

const getQueryClient = cache(createQueryClient)
const caller = createCaller(createContext)

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
	caller,
	getQueryClient
)

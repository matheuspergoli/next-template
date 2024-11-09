import { type NextRequest } from "next/server"

import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

import { appRouter } from "@/server/root"
import { createTRPCContext } from "@/server/trpc"

const createContext = (req: NextRequest) => {
	return createTRPCContext({
		headers: req.headers
	})
}

const handler = (req: NextRequest) => {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req),
		onError: (opts) => {
			console.log("TRPC Error", {
				data: opts.error.name,
				code: opts.error.code,
				message: opts.error.message
			})
		}
	})
}

export { handler as GET, handler as POST }

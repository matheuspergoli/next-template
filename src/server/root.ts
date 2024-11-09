import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

import { createCallerFactory, createTRPCRouter } from "@/server/trpc"

import { authRouter } from "./routers/auth"
import { exampleRouter } from "./routers/example"
import { userRouter } from "./routers/user"

export const appRouter = createTRPCRouter({
	auth: authRouter,
	user: userRouter,
	example: exampleRouter
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

export const createCaller = createCallerFactory(appRouter)

import { z } from "zod"

import { createRoute } from "@/libs/create-route"

export const Routes = {
	home: createRoute(() => "/"),
	hello: createRoute((p) => `/hello/${p.name}`, {
		params: z.object({
			name: z.string()
		}),
		search: z.object({
			surname: z.string()
		})
	})
}

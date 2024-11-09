import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query"
import SuperJSON from "superjson"

export const createQueryClient = () => {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000
			},
			dehydrate: {
				serializeData: SuperJSON.serialize,
				shouldDehydrateQuery: (query) => {
					return defaultShouldDehydrateQuery(query) || query.state.status === "pending"
				}
			},
			hydrate: {
				deserializeData: SuperJSON.deserialize
			}
		}
	})
}

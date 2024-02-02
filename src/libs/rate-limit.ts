import { LRUCache } from "lru-cache"

interface Options {
	uniqueTokenPerInterval?: number // número máximo de tokens únicos no período de tempo
	interval?: number // intervalo em milissegundos
	limit: number // número máximo de requisições dentro do intervalo
}

export const rateLimit = (options?: Options) => {
	const tokenCache = new LRUCache({
		max: options?.uniqueTokenPerInterval ?? 50, // número máximo de tokens a serem armazenados no LRU Cache
		ttl: options?.interval ?? 60 * 1000 // 1 minuto
	})

	return {
		check: (token: string, limit = options?.limit ?? 100) => {
			const tokenCount = (tokenCache.get(token) as number[]) || [0]

			if (tokenCount[0] === 0) {
				tokenCache.set(token, tokenCount)
			}

			tokenCount[0] += 1

			const currentUsage = tokenCount[0] ?? 0 // fornece um valor padrão de 0 se currentUsage for undefined
			const isRateLimited = currentUsage >= limit

			return {
				isRateLimited,
				currentUsage: currentUsage || 0, // fornece um valor padrão de 0 se currentUsage for undefined
				limit
			}
		}
	}
}

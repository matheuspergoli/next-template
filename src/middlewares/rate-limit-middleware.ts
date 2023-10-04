import { env } from '@environment/env'
import { getToken } from 'next-auth/jwt'
import { rateLimit } from '@libs/rate-limit'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

const limiter = rateLimit({
	limit: 500,
	interval: 60 * 60 * 1000 // 1 hour
})

/**
 * @limiter_config - Configuração do rate limit para 500 requisições por hora
 */

export const RateLimitMiddleware: MiddlewareFactory = (next) => {
	return async (request: NextRequest, _next: NextFetchEvent) => {
		const pathname = request.nextUrl.pathname
		const paths = ['/api/site']

		/**
		 * @rate_limit - Exemplo de middleware de rate limit para todas as rotas que começam com '/api/site'
		 * @config - Utilizando o Token-JWT para limitar as requisições com base no sub do token (id do usuário)
		 */

		if (paths.some((path) => pathname.startsWith(path))) {
			const token = await getToken({
				req: request,
				secret: env.NEXTAUTH_SECRET
			})

			const { isRateLimited, limit, currentUsage } = limiter.check(token?.sub as string)
			console.log(`[RATE USAGE] ${currentUsage}/${limit}`)

			if (isRateLimited) {
				return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
			}
		}

		return next(request, _next)
	}
}

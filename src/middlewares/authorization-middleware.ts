import { NextRequest } from "next/server"

export const authorizationMiddleware = (request: NextRequest) => {
	const pathname = request.nextUrl.pathname

	/**
	 * @verification - Exemplo de middleware de autorização para todas as rotas que começam com '/'
	 */

	// const token = await getToken({
	// 	req: request,
	// 	secret: process.env.NEXTAUTH_SECRET
	// })
	// if (!token) {
	// 	return NextResponse.redirect(new URL('/', request.url))
	// }
	// if (token.role === 'USER') {
	// 	return NextResponse.redirect(new URL('/', request.url))
	// }

	console.log(`[Authorization Middleware] Log from [Path] ${pathname}`)
}

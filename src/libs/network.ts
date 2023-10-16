type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 429 | 500 | 503

interface HttpResultSuccess<T> {
	data: T
	success: true
	status: HttpStatusCode
}

interface HttpResultError {
	success: false
	status: HttpStatusCode
	error: unknown
}

type HttpResult<T> = HttpResultSuccess<T> | HttpResultError

interface HttpHandlerOptions {
	baseURL?: string
	defaultTimeout?: number
	defaultHeaders?: HeadersInit
}

export const createHttpHandler = (options: HttpHandlerOptions = {}) => {
	const { baseURL = '', defaultTimeout = 5000, defaultHeaders = {} } = options

	const normalizeUrl = (url: string): string => {
		if (url.startsWith('/')) {
			url = url.slice(1)
		}
		return url
	}

	const getDefaultHeaders = (): HeadersInit => ({
		...defaultHeaders,
		'Content-Type': 'application/json'
	})

	const convertToHttpStatusCode = (status: number): HttpStatusCode => {
		const validStatusCodes: HttpStatusCode[] = [
			200, 201, 204, 400, 401, 403, 404, 429, 500, 503
		]
		if (validStatusCodes.includes(status)) {
			return status as HttpStatusCode
		} else {
			return 500
		}
	}

	const formatError = <T>(error: Response): HttpResult<T> => {
		const status = convertToHttpStatusCode(error.status)
		if (status.toString().startsWith('4') || status.toString().startsWith('5')) {
			return { success: false, error, status }
		} else {
			return { success: false, error, status: 500 }
		}
	}

	const formatResponse = async <T>(response: Response): Promise<HttpResult<T>> => {
		const status = convertToHttpStatusCode(response.status)
		if (status.toString().startsWith('2')) {
			try {
				const data = (await response.json()) as T
				return { success: true, data, status }
			} catch (error) {
				return { success: false, error, status: 500 }
			}
		} else {
			return formatError(response)
		}
	}

	const request = async <T>(
		url: string,
		method: string,
		data?: Record<string, unknown>,
		params?: RequestInit
	): Promise<HttpResult<T>> => {
		const controller = new AbortController()
		try {
			const response = await Promise.race([
				fetch(new URL(baseURL).href + normalizeUrl(url), {
					method,
					headers: getDefaultHeaders(),
					body: data ? JSON.stringify(data) : undefined,
					signal: controller.signal,
					...params
				}),
				new Promise<Response>((_, reject) => {
					const timeout = setTimeout(() => {
						clearTimeout(timeout)
						reject(new Error('Tempo de requisição excedido'))
					}, defaultTimeout)
				})
			])
			return formatResponse(response)
		} catch (error) {
			controller.abort()
			if (error instanceof Response) {
				return formatError(error)
			} else {
				return { success: false, error, status: 500 }
			}
		}
	}

	const get = <T>(url: string, params?: RequestInit) => {
		return request<T>(url, 'GET', undefined, params)
	}

	const post = <T>(url: string, data?: Record<string, unknown>, params?: RequestInit) => {
		return request<T>(url, 'POST', data, params)
	}

	const put = <T>(url: string, data?: Record<string, unknown>, params?: RequestInit) => {
		return request<T>(url, 'PUT', data, params)
	}

	const del = <T>(url: string, data?: Record<string, unknown>, params?: RequestInit) => {
		return request<T>(url, 'DELETE', data, params)
	}

	return {
		get,
		put,
		post,
		delete: del
	}
}

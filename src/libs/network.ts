type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 429 | 500 | 503

type HttpMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'

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
	defaultHeaders?: HeadersInit
}

export const createHttpHandler = (options: HttpHandlerOptions = {}) => {
	const { baseURL = '', defaultHeaders = {} } = options

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

	const formatResponse = async <T>(response: Response): Promise<HttpResult<T>> => {
		const status = response.status as HttpStatusCode
		if (response.ok) {
			try {
				const data = (await response.json()) as T
				return { success: true, data, status }
			} catch (error) {
				return { success: false, error, status }
			}
		} else {
			return { success: false, error: response.statusText, status }
		}
	}

	const request = async <T>(
		url: string,
		method: HttpMethods,
		data?: Record<string, unknown>,
		params?: RequestInit
	): Promise<HttpResult<T>> => {
		try {
			const response = await fetch(new URL(baseURL).href + normalizeUrl(url), {
				method,
				headers: getDefaultHeaders(),
				body: data ? JSON.stringify(data) : undefined,
				...params
			})
			return formatResponse<T>(response)
		} catch (error) {
			if (error instanceof Response) {
				return formatResponse<T>(error)
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

import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios'

interface HttpResultSuccess<T> {
	data: T
	success: true
	status: number
}

interface HttpResultError {
	success: false
	status: number
	error: unknown
}

type HttpResult<T> = HttpResultSuccess<T> | HttpResultError

interface HttpRequestOptions {
	url: string
	data?: Record<string, unknown>
	params?: Record<string, unknown>
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

type HttpRequest = <T>(options: HttpRequestOptions) => Promise<HttpResult<T>>

type InterceptorCallback = (
	config: InternalAxiosRequestConfig
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>

type Interceptor = (
	onFulfilled?: InterceptorCallback,
	onRejected?: (error: unknown) => unknown
) => void

interface HttpClient {
	get: <T>(opts: Omit<HttpRequestOptions, 'method'>) => Promise<HttpResult<T>>
	post: <T>(opts: Omit<HttpRequestOptions, 'method'>) => Promise<HttpResult<T>>
	put: <T>(opts: Omit<HttpRequestOptions, 'method'>) => Promise<HttpResult<T>>
	delete: <T>(opts: Omit<HttpRequestOptions, 'method'>) => Promise<HttpResult<T>>
	addInterceptor: Interceptor
}

export const createHttpClient = ({ baseURL }: { baseURL?: string }): HttpClient => {
	const client = axios.create({
		baseURL: baseURL ?? ''
	})

	const formatError = <T>({ error }: { error: unknown }): HttpResult<T> => {
		if (isAxiosError(error)) {
			return { success: false, error, status: error.response?.status || 500 }
		}
		return { success: false, error, status: 500 }
	}

	const makeRequest: HttpRequest = async ({ url, data, params, method }) => {
		try {
			const response = await client.request({
				url,
				data,
				params,
				method
			})
			return { success: true, data: response.data, status: response.status }
		} catch (error) {
			return formatError({ error })
		}
	}

	const addInterceptor = (
		onFulfilled?: InterceptorCallback,
		onRejected?: (error: unknown) => unknown
	) => {
		client.interceptors.request.use(onFulfilled, onRejected)
	}

	return {
		addInterceptor,
		get: (opts) => makeRequest({ ...opts, method: 'GET' }),
		post: (opts) => makeRequest({ ...opts, method: 'POST' }),
		put: (opts) => makeRequest({ ...opts, method: 'PUT' }),
		delete: (opts) => makeRequest({ ...opts, method: 'DELETE' })
	}
}

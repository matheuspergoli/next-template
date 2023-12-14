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
	get: HttpRequest
	post: HttpRequest
	put: HttpRequest
	delete: HttpRequest
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

	const makeRequest: HttpRequest = async ({ url, data, params }) => {
		try {
			const response = await client.request({
				url,
				data,
				params
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

	const get: HttpRequest = ({ url, data, params }) => makeRequest({ url, data, params })
	const post: HttpRequest = ({ url, data, params }) => makeRequest({ url, data, params })
	const put: HttpRequest = ({ url, data, params }) => makeRequest({ url, data, params })
	const del: HttpRequest = ({ url, data, params }) => makeRequest({ url, data, params })

	return {
		get,
		post,
		put,
		delete: del,
		addInterceptor
	}
}

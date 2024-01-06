import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios'

import { Either, left, right } from '@/libs/either'

interface HttpResultSuccess<T> {
	data: T
	status: number
}

interface HttpResultError {
	status: number
	error: unknown
}

type HttpResult<T> = Either<HttpResultError, HttpResultSuccess<T>>

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

type HttpClient = (props?: { baseURL?: string }) => {
	get: <T>(opts: Omit<HttpRequestOptions, 'method'>) => Promise<HttpResult<T>>
	post: <T>(opts: Omit<HttpRequestOptions, 'method'>) => Promise<HttpResult<T>>
	put: <T>(opts: Omit<HttpRequestOptions, 'method'>) => Promise<HttpResult<T>>
	delete: <T>(opts: Omit<HttpRequestOptions, 'method'>) => Promise<HttpResult<T>>
	addInterceptor: Interceptor
}

export const createHttpClient: HttpClient = (props) => {
	const client = axios.create({
		baseURL: props?.baseURL || ''
	})

	const formatError = <T>({ error }: { error: unknown }): HttpResult<T> => {
		if (isAxiosError(error)) {
			return left({ error, status: error.response?.status || 500 })
		}
		return left({ error, status: 500 })
	}

	const makeRequest: HttpRequest = async ({ url, data, params, method }) => {
		try {
			const response = await client.request({
				url,
				data,
				params,
				method
			})
			return right({ data: response.data, status: response.status })
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

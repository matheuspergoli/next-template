import axios, { Axios, AxiosError, InternalAxiosRequestConfig } from 'axios'

export type HttpResult<T> =
	| { data: T; success: true; status: number }
	| { success: false; status: number; error: unknown }

export class HttpHandler {
	protected client: Axios

	constructor(private readonly baseURL?: string) {
		this.client = axios.create({
			baseURL: this.baseURL ?? ''
		})
	}

	public async get<T>(url: string, params?: never): Promise<HttpResult<T>> {
		try {
			const response = await this.client.get(url, params)
			return { success: true, data: response.data, status: response.status }
		} catch (error) {
			return this.formatError(error)
		}
	}

	public async post<T>(url: string, data?: object): Promise<HttpResult<T>> {
		try {
			const response = await this.client.post(url, data)
			return { success: true, data: response.data, status: response.status }
		} catch (error) {
			return this.formatError(error)
		}
	}

	public async put<T>(url: string, data?: object): Promise<HttpResult<T>> {
		try {
			const response = await this.client.put(url, data)
			return { success: true, data: response.data, status: response.status }
		} catch (error) {
			return this.formatError(error)
		}
	}

	public async delete<T>(url: string, params?: never): Promise<HttpResult<T>> {
		try {
			const response = await this.client.delete(url, params)
			return { success: true, data: response.data, status: response.status }
		} catch (error) {
			return this.formatError(error)
		}
	}

	public addInterceptor(
		onFulfilled?: (
			config: InternalAxiosRequestConfig
		) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
		onRejected?: (error: unknown) => unknown
	) {
		this.client.interceptors.request.use(onFulfilled, onRejected)
	}

	protected formatError<T>(error: unknown): HttpResult<T> {
		if (error instanceof AxiosError) {
			return { success: false, error: error, status: error.response?.status || 500 }
		}
		return { success: false, error: error, status: 500 }
	}
}

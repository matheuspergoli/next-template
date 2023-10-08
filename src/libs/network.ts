import axios, { Axios, AxiosError, InternalAxiosRequestConfig } from 'axios'

export type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500

export type HttpResult<T> =
	| { data: T; success: true; status: HttpStatusCode }
	| { success: false; status: HttpStatusCode; error: unknown }

export class HttpHandler {
	protected client: Axios

	constructor(private readonly baseURL?: string) {
		this.client = axios.create({
			baseURL: this.baseURL?.endsWith('/') ? this.baseURL : `${this.baseURL}/`
		})
	}

	public async get<T>(url: string, params?: never): Promise<HttpResult<T>> {
		try {
			const response = await this.client.get(url, params)
			const status = this.convertToHttpStatusCode(response.status)
			if (status !== undefined) {
				return { success: true, data: response.data, status }
			} else {
				throw new Error(`Invalid status code: ${response.status}`)
			}
		} catch (error) {
			return this.formatError(error)
		}
	}

	public async post<T>(url: string, data?: object): Promise<HttpResult<T>> {
		try {
			const response = await this.client.post(url, data)
			const status = this.convertToHttpStatusCode(response.status)
			if (status !== undefined) {
				return { success: true, data: response.data, status }
			} else {
				throw new Error(`Invalid status code: ${response.status}`)
			}
		} catch (error) {
			return this.formatError(error)
		}
	}

	public async put<T>(url: string, data?: object): Promise<HttpResult<T>> {
		try {
			const response = await this.client.put(url, data)
			const status = this.convertToHttpStatusCode(response.status)
			if (status !== undefined) {
				return { success: true, data: response.data, status }
			} else {
				throw new Error(`Invalid status code: ${response.status}`)
			}
		} catch (error) {
			return this.formatError(error)
		}
	}

	public async delete<T>(url: string, params?: never): Promise<HttpResult<T>> {
		try {
			const response = await this.client.delete(url, params)
			const status = this.convertToHttpStatusCode(response.status)
			if (status !== undefined) {
				return { success: true, data: response.data, status }
			} else {
				throw new Error(`Invalid status code: ${response.status}`)
			}
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

	protected convertToHttpStatusCode(status: number): HttpStatusCode | undefined {
		const validStatusCodes: HttpStatusCode[] = [200, 201, 204, 400, 401, 403, 404, 500]
		if (validStatusCodes.includes(status as HttpStatusCode)) {
			return status as HttpStatusCode
		}
	}

	protected formatError<T>(error: unknown): HttpResult<T> {
		if (error instanceof AxiosError) {
			const status = this.convertToHttpStatusCode(error.response?.status ?? 500)
			if (status !== undefined) {
				return { success: false, error: error, status }
			} else {
				throw new Error(`Invalid status code: ${error.response?.status}`)
			}
		}
		return { success: false, error: error, status: 500 }
	}
}

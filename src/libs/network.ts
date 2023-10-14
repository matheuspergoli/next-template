export type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500

export type HttpResult<T> =
	| { data: T; success: true; status: HttpStatusCode }
	| { success: false; status: HttpStatusCode; error: unknown }

export class HttpHandler {
	constructor(
		private readonly baseURL: string = '',
		private readonly defaultTimeout: number = 5000,
		private readonly defaultHeaders: HeadersInit = {}
	) {
		this.baseURL = new URL(baseURL).href
	}

	public async get<T>(url: string, params?: RequestInit): Promise<HttpResult<T>> {
		return this.request<T>(url, 'GET', undefined, params)
	}

	public async post<T>(
		url: string,
		data: Record<string, unknown>,
		params?: RequestInit
	): Promise<HttpResult<T>> {
		return this.request<T>(url, 'POST', data, params)
	}

	public async put<T>(
		url: string,
		data: Record<string, unknown>,
		params?: RequestInit
	): Promise<HttpResult<T>> {
		return this.request<T>(url, 'PUT', data, params)
	}

	public async delete<T>(url: string, params?: RequestInit): Promise<HttpResult<T>> {
		return this.request<T>(url, 'DELETE', undefined, params)
	}

	private async request<T>(
		url: string,
		method: string,
		data?: Record<string, unknown>,
		params?: RequestInit
	): Promise<HttpResult<T>> {
		const controller = new AbortController()
		try {
			const response = await Promise.race([
				fetch(this.baseURL + this.normalizeUrl(url), {
					method,
					body: data ? JSON.stringify(data) : undefined,
					...params,
					headers: this.getHeaders(),
					signal: controller.signal
				}),
				new Promise<Response>((_, reject) => {
					const timeout = setTimeout(() => {
						clearTimeout(timeout)
						reject(new Error('Request timeout'))
					}, this.defaultTimeout)
				})
			])
			return this.formatResponse(response)
		} catch (error) {
			controller.abort()
			return this.formatError(error)
		}
	}

	private getHeaders(): HeadersInit {
		return {
			...this.defaultHeaders,
			'Content-Type': 'application/json'
		}
	}

	private normalizeUrl(url: string): string {
		if (url.startsWith('/')) {
			url = url.slice(1)
		}
		return url
	}

	protected convertToHttpStatusCode(status: number): HttpStatusCode | undefined {
		const validStatusCodes: HttpStatusCode[] = [200, 201, 204, 400, 401, 403, 404, 500]
		if (validStatusCodes.includes(status as HttpStatusCode)) {
			return status as HttpStatusCode
		} else {
			throw new Error(`Código de status inválido: ${status}`)
		}
	}

	protected formatError<T>(error: unknown): HttpResult<T> {
		if (error instanceof Error) {
			const response = error as unknown as Response
			const status = this.convertToHttpStatusCode(response?.status ?? 500)
			if (status !== undefined) {
				return { success: false, error: response, status }
			} else {
				throw new Error(`Código de status inválido: ${response?.status}`)
			}
		}
		return { success: false, error: error as Error, status: 500 }
	}

	protected async formatResponse<T>(response: Response): Promise<HttpResult<T>> {
		const status = this.convertToHttpStatusCode(response.status)
		if (status !== undefined) {
			try {
				const data = (await response.json()) as T
				return { success: true, data, status }
			} catch (error) {
				return { success: false, error, status: 500 }
			}
		} else {
			throw new Error(`Código de status inválido: ${response.status}`)
		}
	}
}

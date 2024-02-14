import {
	ReadonlyURLSearchParams,
	useParams as useNextParams,
	useSearchParams as useNextSearchParams
} from "next/navigation"

import { z } from "zod"

interface RouteBuilder<
	Params extends z.ZodSchema,
	Search extends z.ZodSchema,
	Options = z.input<Params> & { search: z.input<Search> }
> {
	(opts?: Options): string
	useParams: () => z.output<Params>
	useSearchParams: () => z.output<Search>
	parseSearchParams: (searchParams: unknown) => z.output<Search>
	parseParams: (params: unknown) => z.output<Params>
}

export function createRoute<Params extends z.ZodSchema, Search extends z.ZodSchema>(
	fn: (params: z.input<Params>) => string,
	options: { params?: Params; search?: Search } = {}
): RouteBuilder<Params, Search> {
	const params = options.params ?? ({} as Params)
	const search = options.search ?? ({} as Search)

	const routeBuilder: RouteBuilder<Params, Search> = (opts) => {
		const baseUrl = fn(opts)
		const searchString = search && new URLSearchParams(opts?.search).toString()
		return [baseUrl, searchString ? `?${searchString}` : ""].join("")
	}

	routeBuilder.parseSearchParams = function parseSearchParams(input: unknown) {
		const res = search.safeParse(input)
		if (!res.success) {
			throw new Error(`Invalid search params for route: ${res.error.message}`, {
				cause: "Error for search params"
			})
		}
		return res.data
	}

	routeBuilder.parseParams = function parseParams(input: unknown) {
		const res = params.safeParse(input)
		if (!res.success) {
			throw new Error(`Invalid route params for route: ${res.error.message}`, {
				cause: "Error for route params"
			})
		}
		return res.data
	}

	routeBuilder.useParams = function useParams(): z.output<Params> {
		const res = params.safeParse(useNextParams())
		if (!res.success) {
			throw new Error(`Invalid route params for route: ${res.error.message}`, {
				cause: "Error for route params"
			})
		}
		return res.data
	}

	routeBuilder.useSearchParams = function useSearchParams(): z.output<Search> {
		const res = search.safeParse(convertURLSearchParamsToObject(useNextSearchParams()))
		if (!res.success) {
			throw new Error(`Invalid search params for route ${res.error.message}`, {
				cause: "Error for search params"
			})
		}
		return res.data
	}

	return routeBuilder
}

function convertURLSearchParamsToObject(
	params: ReadonlyURLSearchParams | null
): Record<string, string | string[]> {
	if (!params) {
		return {}
	}

	const obj: Record<string, string | string[]> = {}
	for (const [key, value] of params.entries()) {
		if (params.getAll(key).length > 1) {
			obj[key] = params.getAll(key)
		} else {
			obj[key] = value
		}
	}
	return obj
}
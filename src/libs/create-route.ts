import {
	ReadonlyURLSearchParams,
	useParams as useNextParams,
	useSearchParams as useNextSearchParams
} from "next/navigation"

import { z } from "zod"

interface RouteBuilder<Params extends z.ZodSchema, Search extends z.ZodSchema> {
	(params?: z.input<Params>, search?: z.input<Search>): string
	useParams: () => z.output<Params>
	useSearchParams: () => z.output<Search>
	params: z.output<Params>
}

export function createRoute<Params extends z.ZodSchema, Search extends z.ZodSchema>(
	fn: (params: z.input<Params>) => string,
	options: { params?: Params; search?: Search } = {}
): RouteBuilder<Params, Search> {
	const params = options.params ?? ({} as Params)
	const search = options.search ?? ({} as Search)

	const routeBuilder: RouteBuilder<Params, Search> = (params, search) => {
		const baseUrl = fn(params)
		const searchString = search && new URLSearchParams(search).toString()
		return [baseUrl, searchString ? `?${searchString}` : ""].join("")
	}

	routeBuilder.useParams = function useParams(): z.output<Params> {
		const res = params.safeParse(useNextParams())
		if (!res.success) {
			throw new Error(`Invalid route params for route: ${res.error.message}`)
		}
		return res.data
	}

	routeBuilder.useSearchParams = function useSearchParams(): z.output<Search> {
		const res = search.safeParse(convertURLSearchParamsToObject(useNextSearchParams()))
		if (!res.success) {
			throw new Error(`Invalid search params for route ${res.error.message}`)
		}
		return res.data
	}

	routeBuilder.params = undefined as z.output<Params>
	Object.defineProperty(routeBuilder, "params", {
		get() {
			throw new Error(
				"Routes.[route].params is only for type usage, not runtime. Use it like `typeof Routes.[routes].params`"
			)
		}
	})

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

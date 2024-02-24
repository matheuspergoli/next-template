import { wrap } from "@typeschema/all"
import type { Infer, InferIn, Schema } from "@typeschema/all"

interface CreateActionOptions<Context> {
	middleware?: () => Promise<boolean>
	context?: () => Promise<Context>
}

export const actionBuilder = <Context = never>(
	options?: CreateActionOptions<Context>
) => {
	const executeContext = async () => {
		return ((await options?.context?.()) ?? null) as Context
	}

	const executeMiddleware = async () => {
		const mwResponse = (await Promise.resolve(options?.middleware?.())) ?? true
		if (!mwResponse) {
			throw new Error("Middleware failed")
		}
	}

	const parseSchema = async <S extends Schema>(
		schema: S,
		data: unknown,
		message = "Invalid data"
	) => {
		const parsedValues = await wrap(schema).validate(data)
		if ("issues" in parsedValues) {
			throw new Error(message)
		}
		return parsedValues.data
	}

	const execute = <Data, Args extends unknown[]>(
		handler: [Context] extends [never]
			? (...args: Args) => Promise<Data>
			: (ctx: Context, ...args: Args) => Promise<Data>
	) => {
		return async (...args: Args) => {
			await executeMiddleware()
			const ctx = await executeContext()
			if (ctx) {
				const data = ((await handler(ctx, ...args)) ?? null) as Data
				return data
			}
			// @ts-expect-error - resolver problema dos params com tuple
			const data = ((await handler(...args)) ?? null) as Data
			return data
		}
	}

	const input = <InputSchema extends Schema>(inputSchema: InputSchema) => {
		const execute = <Data>(
			handler: [Context] extends [never]
				? (opts: { input: InferIn<InputSchema> }) => Promise<Data>
				: (opts: { ctx: Context; input: InferIn<InputSchema> }) => Promise<Data>
		) => {
			return async (input: InferIn<InputSchema>) => {
				const parsedInput = await parseSchema(inputSchema, input, "Invalid input")
				await executeMiddleware()
				const ctx = await executeContext()
				if (ctx) {
					const data = ((await handler({ ctx, input: parsedInput })) ?? null) as Data
					return data
				}
				// @ts-expect-error - resolver problema dos params com tuple
				const data = ((await handler({ input: parsedInput })) ?? null) as Data
				return data
			}
		}

		const output = <OutputSchema extends Schema>(outputSchema: OutputSchema) => {
			const execute = (
				handler: [Context] extends [never]
					? (opts: { input: InferIn<InputSchema> }) => Promise<Infer<OutputSchema>>
					: (opts: {
							ctx: Context
							input: InferIn<InputSchema>
						}) => Promise<Infer<OutputSchema>>
			) => {
				return async (input: InferIn<InputSchema>) => {
					const parsedInput = await parseSchema(inputSchema, input, "Invalid input")
					await executeMiddleware()
					const ctx = await executeContext()
					if (ctx) {
						const data = (await handler({ ctx, input: parsedInput })) ?? null
						const parsedOutput = await parseSchema(outputSchema, data, "Invalid output")
						return parsedOutput
					}
					// @ts-expect-error - resolver problema dos params com tuple
					const data = (await handler({ input: parsedInput })) ?? null
					const parsedOutput = await parseSchema(outputSchema, data, "Invalid output")
					return parsedOutput
				}
			}

			return { execute }
		}

		return { execute, output }
	}

	const output = <OutputSchema extends Schema>(outputSchema: OutputSchema) => {
		const execute = <Args extends unknown[]>(
			handler: [Context] extends [never]
				? (...args: Args) => Promise<Infer<OutputSchema>>
				: (ctx: Context, ...args: Args) => Promise<Infer<OutputSchema>>
		) => {
			return async (...args: Args) => {
				await executeMiddleware()
				const ctx = await executeContext()
				if (ctx) {
					const data = (await handler(ctx, ...args)) ?? null
					const parsedOutput = await parseSchema(outputSchema, data, "Invalid output")
					return parsedOutput
				}
				// @ts-expect-error - resolver problema dos params com tuple
				const data = (await handler(...args)) ?? null
				const parsedOutput = await parseSchema(outputSchema, data, "Invalid output")
				return parsedOutput
			}
		}

		const input = <InputSchema extends Schema>(inputSchema: InputSchema) => {
			const execute = (
				handler: [Context] extends [never]
					? (opts: { input: InferIn<InputSchema> }) => Promise<Infer<OutputSchema>>
					: (opts: {
							ctx: Context
							input: InferIn<InputSchema>
						}) => Promise<Infer<OutputSchema>>
			) => {
				return async (input: InferIn<InputSchema>) => {
					const parsedInput = await parseSchema(inputSchema, input, "Invalid input")
					await executeMiddleware()
					const ctx = await executeContext()
					if (ctx) {
						const data = (await handler({ ctx, input: parsedInput })) ?? null
						const parsedOutput = await parseSchema(outputSchema, data, "Invalid output")
						return parsedOutput
					}
					// @ts-expect-error - resolver problema dos params com tuple
					const data = (await handler({ input: parsedInput })) ?? null
					const parsedOutput = await parseSchema(outputSchema, data, "Invalid output")
					return parsedOutput
				}
			}

			return { execute }
		}

		return { execute, input }
	}

	return { execute, input, output }
}

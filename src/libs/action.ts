import { z } from "zod"

type MaybePromise<T> = Promise<T> | T

interface ActionBuilderOptions<Context> {
	middleware?: (parsedInput: unknown) => MaybePromise<Context>
}

export const actionBuilder = <Context>(options?: ActionBuilderOptions<Context>) => {
	const executeMiddleware = async (args: unknown) => {
		return (await Promise.resolve(options?.middleware?.(args))) as Context
	}

	const parseSchema = <S extends z.ZodSchema, T>(
		schema: S,
		data: T,
		message = "Invalid data"
	) => {
		const parsedValues = schema.safeParse(data)
		if (!parsedValues.success) {
			const path = parsedValues.error.issues[0]?.path.toString().toUpperCase()
			const errorMessage = parsedValues.error.issues[0]?.message
			throw new Error(`${message} for [${path}]: ${errorMessage}`)
		}
		return parsedValues.data as T
	}

	const execute = <Data, Args extends unknown[]>(
		handler: (ctx: Context, ...args: Args) => Promise<Data>
	) => {
		return async (...args: Args) => {
			const ctx = await executeMiddleware(args)
			const data = (await handler(ctx, ...args)) as Data
			return data
		}
	}

	const input = <InputSchema extends z.ZodSchema>(inputSchema: InputSchema) => {
		const execute = <Data>(
			handler: (opts: { input: z.input<InputSchema>; ctx: Context }) => Promise<Data>
		) => {
			return async (input: z.input<InputSchema>) => {
				const parsedInput = parseSchema(inputSchema, input, "Invalid Input")
				const ctx = await executeMiddleware(parsedInput)
				const data = (await handler({ input: parsedInput, ctx })) as Data
				return data
			}
		}

		return { execute }
	}

	return { execute, input }
}

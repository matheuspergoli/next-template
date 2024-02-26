import { z } from "zod"

interface ActionBuilderOptions {
	middleware?: () => Promise<boolean>
}

export const actionBuilder = (options?: ActionBuilderOptions) => {
	const executeMiddleware = async () => {
		const mwResponse = (await Promise.resolve(options?.middleware?.())) ?? true
		if (!mwResponse) {
			throw new Error("Middleware failed")
		}
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
		handler: (...args: Args) => Promise<Data>
	) => {
		return async (...args: Args) => {
			await executeMiddleware()
			const data = (await handler(...args)) as Data
			return data
		}
	}

	const input = <InputSchema extends z.ZodSchema>(inputSchema: InputSchema) => {
		const execute = <Data>(
			handler: (opts: { input: z.input<InputSchema> }) => Promise<Data>
		) => {
			return async (input: z.input<InputSchema>) => {
				await executeMiddleware()
				const parsedInput = parseSchema(inputSchema, input, "Invalid Input")
				const data = (await handler({ input: parsedInput })) as Data
				return data
			}
		}

		const output = <OutputSchema extends z.ZodSchema>(outputSchema: OutputSchema) => {
			const execute = (
				handler: (opts: {
					input: z.input<InputSchema>
				}) => Promise<z.output<OutputSchema>>
			) => {
				return async (input: z.input<InputSchema>) => {
					await executeMiddleware()
					const parsedInput = parseSchema(inputSchema, input, "Invalid Input")
					const data = await handler({ input: parsedInput })
					const parsedOutput = parseSchema(outputSchema, data, "Invalid Output")
					return parsedOutput
				}
			}

			return { execute }
		}

		return { execute, output }
	}

	const output = <OutputSchema extends z.ZodSchema>(outputSchema: OutputSchema) => {
		const execute = <Args extends unknown[]>(
			handler: (...args: Args) => Promise<z.output<OutputSchema>>
		) => {
			return async (...args: Args) => {
				await executeMiddleware()
				const data = await handler(...args)
				const parsedOutput = parseSchema(outputSchema, data, "Invalid Output")
				return parsedOutput
			}
		}

		const input = <InputSchema extends z.ZodSchema>(inputSchema: InputSchema) => {
			const execute = (
				handler: (opts: {
					input: z.input<InputSchema>
				}) => Promise<z.output<OutputSchema>>
			) => {
				return async (input: z.input<InputSchema>) => {
					await executeMiddleware()
					const parsedInput = parseSchema(inputSchema, input, "Invalid Input")
					const data = await handler({ input: parsedInput })
					const parsedOutput = parseSchema(outputSchema, data, "Invalid Output")
					return parsedOutput
				}
			}

			return { execute }
		}

		return { execute, input }
	}

	return { execute, input, output }
}

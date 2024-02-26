import { wrap } from "@typeschema/all"
import type { Infer, InferIn, Schema } from "@typeschema/all"

export const actionBuilder = () => {
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
		handler: (...args: Args) => Promise<Data>
	) => {
		return async (...args: Args) => {
			const data = ((await handler(...args)) ?? null) as Data
			return data
		}
	}

	const input = <InputSchema extends Schema>(inputSchema: InputSchema) => {
		const execute = <Data>(
			handler: (opts: { input: InferIn<InputSchema> }) => Promise<Data>
		) => {
			return async (input: InferIn<InputSchema>) => {
				const parsedInput = await parseSchema(inputSchema, input, "Invalid input")
				const data = ((await handler({ input: parsedInput })) ?? null) as Data
				return data
			}
		}

		const output = <OutputSchema extends Schema>(outputSchema: OutputSchema) => {
			const execute = (
				handler: (opts: { input: InferIn<InputSchema> }) => Promise<Infer<OutputSchema>>
			) => {
				return async (input: InferIn<InputSchema>) => {
					const parsedInput = await parseSchema(inputSchema, input, "Invalid input")
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
			handler: (...args: Args) => Promise<Infer<OutputSchema>>
		) => {
			return async (...args: Args) => {
				const data = (await handler(...args)) ?? null
				const parsedOutput = await parseSchema(outputSchema, data, "Invalid output")
				return parsedOutput
			}
		}

		const input = <InputSchema extends Schema>(inputSchema: InputSchema) => {
			const execute = (
				handler: (opts: { input: InferIn<InputSchema> }) => Promise<Infer<OutputSchema>>
			) => {
				return async (input: InferIn<InputSchema>) => {
					const parsedInput = await parseSchema(inputSchema, input, "Invalid input")
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

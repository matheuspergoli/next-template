import { z } from "zod"

type Code =
	| "UNAUTHORIZED"
	| "NOT_FOUND"
	| "EXTERNAL_ERROR"
	| "BAD_REQUEST"
	| "FORBIDDEN"
	| "CONFLICT"
	| "PARSE_ERROR"

class UnknownCauseError extends Error {
	[key: string]: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> => {
	return !!value && !Array.isArray(value) && typeof value === "object"
}

const getCauseFromUnknown = (cause: unknown): Error | undefined => {
	if (cause instanceof Error) {
		return cause
	}

	const type = typeof cause
	if (type === "undefined" || type === "function" || cause === null) {
		return undefined
	}

	if (type !== "object") {
		return new Error(String(cause))
	}

	if (isObject(cause)) {
		const err = new UnknownCauseError()
		for (const key in cause) {
			err[key] = cause[key]
		}
		return err
	}

	return undefined
}

export class ActionError extends Error {
	public readonly code: Code
	public override readonly cause?: unknown

	constructor(props: { message?: string; cause?: unknown; code: Code }) {
		const cause = getCauseFromUnknown(props.cause)
		const message = props.message ?? cause?.message ?? props.code

		super(message, { cause })

		this.name = "ActionError"
		this.code = props.code
	}
}

interface Success<T> {
	success: true
	data: T
}

interface Failure {
	success: false
	error: ActionError
}

type Result<T> = Success<T> | Failure
type MaybePromise<T> = Promise<T> | T

const isSuccess = <T>(result: Result<T>): result is Success<T> => result.success

interface ActionBuilderOptions<Context> {
	middleware?: (parsedInput: unknown) => MaybePromise<Context>
	errorHandler?: (error: ActionError) => MaybePromise<void>
}

export const actionBuilder = <Context>(options?: ActionBuilderOptions<Context>) => {
	const handleErrors = (error: unknown): ActionError => {
		if (error instanceof ActionError) {
			return error
		}

		if (error instanceof Error) {
			return new ActionError({
				message: error.message,
				code: "EXTERNAL_ERROR",
				cause: error.cause
			})
		}

		return new ActionError({ message: "Unknown error", code: "EXTERNAL_ERROR" })
	}

	const executeMiddleware = async (args: unknown): Promise<Result<Context>> => {
		try {
			const ctx = (await Promise.resolve(options?.middleware?.(args))) as Context
			return { success: true, data: ctx as Context }
		} catch (error) {
			const handledError = handleErrors(error)
			return { success: false, error: handledError }
		}
	}

	const parseSchema = <S extends z.ZodSchema, T>(
		schema: S,
		data: T,
		message = "Invalid data"
	): Result<T> => {
		try {
			const parsedValues = schema.safeParse(data)
			if (!parsedValues.success) {
				const path = parsedValues.error.issues[0]?.path.toString().toUpperCase()
				const errorMessage = parsedValues.error.issues[0]?.message ?? "Unknown error"
				return {
					success: false,
					error: new ActionError({
						message: `${message}: ${path} ${errorMessage}`,
						code: "PARSE_ERROR"
					})
				}
			}
			return { success: true, data: parsedValues.data as T }
		} catch (error) {
			const handledError = handleErrors(error)
			return {
				success: false,
				error: handledError
			}
		}
	}

	const execute = <Data, Args extends unknown[]>(
		handler: (ctx: Context, ...args: Args) => Promise<Data>
	) => {
		return async (...args: Args): Promise<Result<Data>> => {
			const ctx = await executeMiddleware(args)
			if (!isSuccess(ctx)) {
				return ctx
			}

			try {
				const data = (await handler(ctx.data, ...args)) as Data
				return { success: true, data }
			} catch (error) {
				const handledError = handleErrors(error)
				if (options?.errorHandler) {
					await options.errorHandler(handledError)
				}
				return { success: false, error: handledError }
			}
		}
	}

	const input = <InputSchema extends z.ZodSchema>(inputSchema: InputSchema) => {
		const execute = <Data>(
			handler: (opts: { input: z.input<InputSchema>; ctx: Context }) => Promise<Data>
		) => {
			return async (input: z.input<InputSchema>): Promise<Result<Data>> => {
				const parsedInput = parseSchema(inputSchema, input, "Invalid Input")
				if (!isSuccess(parsedInput)) {
					return parsedInput
				}

				const ctx = await executeMiddleware(parsedInput.data)
				if (!isSuccess(ctx)) {
					return ctx
				}

				try {
					const data = (await handler({ input: parsedInput.data, ctx: ctx.data })) as Data
					return { success: true, data }
				} catch (error) {
					const handledError = handleErrors(error)
					if (options?.errorHandler) {
						await options.errorHandler(handledError)
					}
					return { success: false, error: handledError }
				}
			}
		}

		const output = <OutputSchema extends z.ZodSchema>(outputSchema: OutputSchema) => {
			const execute = (
				handler: (opts: {
					input: z.input<InputSchema>
					ctx: Context
				}) => Promise<z.output<OutputSchema>>
			) => {
				return async (
					input: z.input<InputSchema>
				): Promise<Result<z.output<OutputSchema>>> => {
					const parsedInput = parseSchema(inputSchema, input, "Invalid Input")
					if (!isSuccess(parsedInput)) {
						return parsedInput
					}

					const ctx = await executeMiddleware(parsedInput.data)
					if (!isSuccess(ctx)) {
						return ctx
					}

					try {
						const data = await handler({ input: parsedInput.data, ctx: ctx.data })
						const parsedOutput = parseSchema(outputSchema, data, "Invalid Output")
						if (!isSuccess(parsedOutput)) {
							return parsedOutput
						}
						return { success: true, data: parsedOutput.data }
					} catch (error) {
						const handledError = handleErrors(error)
						if (options?.errorHandler) {
							await options.errorHandler(handledError)
						}
						return { success: false, error: handledError }
					}
				}
			}

			return { execute }
		}

		return { execute, output }
	}

	const output = <OutputSchema extends z.ZodSchema>(outputSchema: OutputSchema) => {
		const execute = (
			handler: (opts: { ctx: Context }) => Promise<z.output<OutputSchema>>
		) => {
			return async (): Promise<Result<z.output<OutputSchema>>> => {
				const ctx = await executeMiddleware(undefined)
				if (!isSuccess(ctx)) {
					return ctx
				}

				try {
					const data = await handler({ ctx: ctx.data })
					const parsedOutput = parseSchema(outputSchema, data, "Invalid Output")
					if (!isSuccess(parsedOutput)) {
						return parsedOutput
					}
					return { success: true, data: parsedOutput.data }
				} catch (error) {
					const handledError = handleErrors(error)
					if (options?.errorHandler) {
						await options.errorHandler(handledError)
					}
					return { success: false, error: handledError }
				}
			}
		}

		const input = <InputSchema extends z.ZodSchema>(inputSchema: InputSchema) => {
			const execute = (
				handler: (opts: {
					input: z.input<InputSchema>
					ctx: Context
				}) => Promise<z.output<OutputSchema>>
			) => {
				return async (
					input: z.input<InputSchema>
				): Promise<Result<z.output<OutputSchema>>> => {
					const parsedInput = parseSchema(inputSchema, input, "Invalid Input")
					if (!isSuccess(parsedInput)) {
						return parsedInput
					}

					const ctx = await executeMiddleware(parsedInput.data)
					if (!isSuccess(ctx)) {
						return ctx
					}

					try {
						const data = await handler({ input: parsedInput.data, ctx: ctx.data })
						const parsedOutput = parseSchema(outputSchema, data, "Invalid Output")
						if (!isSuccess(parsedOutput)) {
							return parsedOutput
						}
						return { success: true, data: parsedOutput.data }
					} catch (error) {
						const handledError = handleErrors(error)
						if (options?.errorHandler) {
							await options.errorHandler(handledError)
						}
						return { success: false, error: handledError }
					}
				}
			}

			return { execute }
		}

		return { execute, input }
	}

	return { execute, input, output }
}

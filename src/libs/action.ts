import { isNotFoundError } from "next/dist/client/components/not-found"
import { isRedirectError } from "next/dist/client/components/redirect"

import { z } from "zod"

type Code =
	| "UNAUTHORIZED"
	| "NOT_FOUND"
	| "INTERNAL_ERROR"
	| "BAD_REQUEST"
	| "FORBIDDEN"
	| "CONFLICT"
	| "ERROR"
	| "TIMEOUT"
	| "PAYLOAD_TOO_LARGE"
	| "TOO_MANY_REQUESTS"
	| "PARSE_INPUT_ERROR"
	| "PARSE_OUTPUT_ERROR"
	| "MIDDLEWARE_ERROR"
	| "NEXT_ERROR"

const DEFAULT_ERROR_MESSAGES: Readonly<Record<Code, string>> = {
	ERROR: "Error",
	TIMEOUT: "Timeout",
	CONFLICT: "Conflict",
	NOT_FOUND: "Not found",
	FORBIDDEN: "Forbidden",
	NEXT_ERROR: "Next error",
	BAD_REQUEST: "Bad request",
	UNAUTHORIZED: "Unauthorized",
	INTERNAL_ERROR: "Internal error",
	MIDDLEWARE_ERROR: "Middleware error",
	PAYLOAD_TOO_LARGE: "Payload too large",
	TOO_MANY_REQUESTS: "Too many requests",
	PARSE_INPUT_ERROR: "Error parsing input",
	PARSE_OUTPUT_ERROR: "Error parsing output"
}

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

type FieldErrors<T = unknown> = {
	[K in keyof T]?: string
}

interface JSONError<T = unknown> {
	message: string
	code: Code
	cause?: unknown
	fieldErrors?: FieldErrors<T>
}

class ActionError<T = unknown> extends Error {
	public readonly code: Code
	public override readonly cause?: unknown
	public readonly fieldErrors?: FieldErrors<T>

	constructor(props: {
		message?: string
		cause?: unknown
		code: Code
		fieldErrors?: FieldErrors<T>
	}) {
		const cause = getCauseFromUnknown(props.cause)
		const message = props.message ?? cause?.message ?? props.code

		super(message, { cause })

		this.name = "ActionError"
		this.code = props.code
		this.fieldErrors = props.fieldErrors
	}

	public toJSON(): JSONError<T> {
		return {
			message: this.message,
			code: this.code,
			cause: this.cause,
			fieldErrors: this.fieldErrors
		}
	}
}

class InputParseError extends ActionError {
	constructor(props: {
		message?: string
		cause?: unknown
		code?: Code
		fieldErrors?: FieldErrors
	}) {
		const code = props.code ?? "PARSE_INPUT_ERROR"
		const cause = getCauseFromUnknown(props.cause)
		const message = props.message ?? cause?.message ?? DEFAULT_ERROR_MESSAGES[code]

		super({ message, cause, code, fieldErrors: props.fieldErrors })

		this.name = "InputParseError"
	}
}

class OutputParseError extends ActionError {
	constructor(props: {
		message?: string
		cause?: unknown
		code?: Code
		fieldErrors?: FieldErrors
	}) {
		const code = props.code ?? "PARSE_OUTPUT_ERROR"
		const cause = getCauseFromUnknown(props.cause)
		const message = props.message ?? cause?.message ?? DEFAULT_ERROR_MESSAGES[code]

		super({ message, cause, code, fieldErrors: props.fieldErrors })

		this.name = "OutputParseError"
	}
}

class MiddlewareError extends ActionError {
	constructor(props: {
		message?: string
		cause?: unknown
		code?: Code
		fieldErrors?: FieldErrors
	}) {
		const code = props.code ?? "MIDDLEWARE_ERROR"
		const cause = getCauseFromUnknown(props.cause)
		const message = props.message ?? cause?.message ?? DEFAULT_ERROR_MESSAGES[code]

		super({ message, cause, code, fieldErrors: props.fieldErrors })

		this.name = "MiddlewareError"
	}
}

export class CustomActionError extends ActionError {
	constructor(props: { message?: string; cause?: unknown; code: Code }) {
		super(props)

		this.name = "CustomActionError"
	}
}

type MaybePromise<T> = Promise<T> | T

type MiddlewareFn<Context, NextContext> = (opts: {
	ctx: Context
	next: <TContext>(opts: { ctx: TContext }) => MaybePromise<TContext>
}) => MaybePromise<NextContext>

interface Success<T> {
	success: true
	data: T
}

interface Failure<T> {
	success: false
	error: JSONError<T>
}

type Result<T, E = unknown> = Success<T> | Failure<E>

const isSuccess = <T>(result: Result<T>): result is Success<T> => result.success

interface BuilderOptions<Context> {
	middleware?: (parsedInput: unknown) => MaybePromise<Context>
	errorHandler?: (error: JSONError) => MaybePromise<void>
	middlewareStack: MiddlewareFn<unknown, unknown>[]
}

const builder = <Context>(options?: BuilderOptions<Context>) => {
	const middlewareStack = options?.middlewareStack ?? []

	const handleErrors = (error: unknown) => {
		if (error instanceof ActionError) {
			return new ActionError({
				message: error.message,
				code: error.code,
				cause: error.cause,
				fieldErrors: error.fieldErrors
			}).toJSON()
		}

		if (isRedirectError(error) || isNotFoundError(error)) {
			return new ActionError({
				message: error.message,
				code: "NEXT_ERROR",
				cause: error.cause
			}).toJSON()
		}

		if (error instanceof Error) {
			return new ActionError({
				message: error.message,
				code: "INTERNAL_ERROR",
				cause: error.cause
			}).toJSON()
		}

		return new ActionError({ message: "Unknown error", code: "INTERNAL_ERROR" }).toJSON()
	}

	const use = <NextContext>(middlewareFn: MiddlewareFn<Context, NextContext>) => {
		const newMiddlewareStack = [
			...middlewareStack,
			middlewareFn as MiddlewareFn<unknown, unknown>
		]

		return builder<NextContext>({
			...options,
			middleware: options?.middleware,
			errorHandler: options?.errorHandler,
			middlewareStack: newMiddlewareStack
		} as BuilderOptions<NextContext>)
	}

	const executeMiddlewareStack = async <Ctx>({
		idx = 0,
		prevCtx
	}: {
		idx?: number
		prevCtx: Ctx
	}): Promise<Ctx> => {
		const middlewareFn = options?.middlewareStack[idx]

		if (middlewareFn) {
			return (await Promise.resolve(
				middlewareFn({
					ctx: prevCtx,
					next: async ({ ctx }) => {
						return await executeMiddlewareStack({ idx: idx + 1, prevCtx: ctx })
					}
				})
			)) as Promise<Ctx>
		}

		return prevCtx
	}

	const executeMiddleware = async (args: unknown): Promise<Result<Context>> => {
		try {
			let context = {} as Context

			if (options?.middleware) {
				context = await Promise.resolve(options.middleware(args))
			}

			const ctx = await Promise.resolve(executeMiddlewareStack({ prevCtx: context }))

			return { success: true, data: ctx as Context }
		} catch (error) {
			const handledError = handleErrors(error)
			return { success: false, error: handledError }
		}
	}

	const parseSchema = <S extends z.ZodSchema, T>(
		schema: S,
		data: T,
		code: Code
	): Result<T> => {
		try {
			const parsedValues = schema.safeParse(data)

			if (!parsedValues.success) {
				const errors = Object.entries(parsedValues.error.flatten().fieldErrors).map(
					([path, message]) => {
						return { path, message }
					}
				)

				const message = errors
					.map(({ path, message }) => {
						if (code === "PARSE_INPUT_ERROR") {
							return `Error parsing input at param: ${path} - ${message}`
						}

						if (code === "PARSE_OUTPUT_ERROR") {
							return `Error parsing output at: ${path} - ${message}`
						}

						return `Error parsing at: ${path} - ${message}`
					})
					.join("\n")

				const fieldErrors = errors.reduce((acc, { path, message }) => {
					return { ...acc, [path]: message?.join("\n") }
				}, {} as FieldErrors<T>)

				return {
					success: false,
					error: new ActionError({
						code,
						message,
						fieldErrors
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

	const execute = <Data>(handler: (props: { ctx: Context }) => Promise<Data>) => {
		return async (): Promise<Result<Data>> => {
			try {
				const ctx = await executeMiddleware(undefined)
				if (!isSuccess(ctx)) {
					throw new MiddlewareError(ctx.error)
				}

				const data = (await handler({ ctx: ctx.data })) as Data

				return { success: true, data }
			} catch (error) {
				const handledError = handleErrors(error)
				if (options?.errorHandler) {
					await options.errorHandler(handledError)
				}
				if (handledError.code === "NEXT_ERROR") {
					throw error
				}
				return { success: false, error: handledError }
			}
		}
	}

	const input = <InputSchema extends z.ZodSchema>(inputSchema: InputSchema) => {
		const execute = <Data>(
			handler: (opts: { input: z.input<InputSchema>; ctx: Context }) => Promise<Data>
		) => {
			return async (
				input: z.input<InputSchema>
			): Promise<Result<Data, z.infer<InputSchema>>> => {
				try {
					const parsedInput = parseSchema(inputSchema, input, "PARSE_INPUT_ERROR")
					if (!isSuccess(parsedInput)) {
						throw new InputParseError(parsedInput.error)
					}

					const ctx = await executeMiddleware(parsedInput.data)
					if (!isSuccess(ctx)) {
						throw new MiddlewareError(ctx.error)
					}

					const data = (await handler({ input: parsedInput.data, ctx: ctx.data })) as Data

					return { success: true, data }
				} catch (error) {
					const handledError = handleErrors(error)
					if (options?.errorHandler) {
						await options.errorHandler(handledError)
					}
					if (handledError.code === "NEXT_ERROR") {
						throw error
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
				): Promise<Result<z.output<OutputSchema>, z.infer<InputSchema>>> => {
					try {
						const parsedInput = parseSchema(inputSchema, input, "PARSE_INPUT_ERROR")
						if (!isSuccess(parsedInput)) {
							throw new InputParseError(parsedInput.error)
						}

						const ctx = await executeMiddleware(parsedInput.data)
						if (!isSuccess(ctx)) {
							throw new MiddlewareError(ctx.error)
						}

						const data = await handler({ input: parsedInput.data, ctx: ctx.data })

						const parsedOutput = parseSchema(outputSchema, data, "PARSE_OUTPUT_ERROR")
						if (!isSuccess(parsedOutput)) {
							throw new OutputParseError(parsedOutput.error)
						}

						return { success: true, data: parsedOutput.data }
					} catch (error) {
						const handledError = handleErrors(error)
						if (options?.errorHandler) {
							await options.errorHandler(handledError)
						}
						if (handledError.code === "NEXT_ERROR") {
							throw error
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
				try {
					const ctx = await executeMiddleware(undefined)
					if (!isSuccess(ctx)) {
						throw new MiddlewareError(ctx.error)
					}

					const data = await handler({ ctx: ctx.data })

					const parsedOutput = parseSchema(outputSchema, data, "PARSE_OUTPUT_ERROR")
					if (!isSuccess(parsedOutput)) {
						throw new OutputParseError(parsedOutput.error)
					}

					return { success: true, data: parsedOutput.data }
				} catch (error) {
					const handledError = handleErrors(error)
					if (options?.errorHandler) {
						await options.errorHandler(handledError)
					}
					if (handledError.code === "NEXT_ERROR") {
						throw error
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
				): Promise<Result<z.output<OutputSchema>, z.infer<InputSchema>>> => {
					try {
						const parsedInput = parseSchema(inputSchema, input, "PARSE_INPUT_ERROR")
						if (!isSuccess(parsedInput)) {
							throw new InputParseError(parsedInput.error)
						}

						const ctx = await executeMiddleware(parsedInput.data)
						if (!isSuccess(ctx)) {
							throw new MiddlewareError(ctx.error)
						}

						const data = await handler({ input: parsedInput.data, ctx: ctx.data })

						const parsedOutput = parseSchema(outputSchema, data, "PARSE_OUTPUT_ERROR")
						if (!isSuccess(parsedOutput)) {
							throw new OutputParseError(parsedOutput.error)
						}

						return { success: true, data: parsedOutput.data }
					} catch (error) {
						const handledError = handleErrors(error)
						if (options?.errorHandler) {
							await options.errorHandler(handledError)
						}
						if (handledError.code === "NEXT_ERROR") {
							throw error
						}
						return { success: false, error: handledError }
					}
				}
			}

			return { execute }
		}

		return { execute, input }
	}

	return { execute, input, output, use }
}

interface ActionBuilderOptions<Context> {
	middleware?: (parsedInput: unknown) => MaybePromise<Context>
	errorHandler?: (error: JSONError) => MaybePromise<void>
}

export const actionBuilder = <Context>(options?: ActionBuilderOptions<Context>) => {
	return {
		create: builder<Context>({
			middleware: options?.middleware,
			errorHandler: options?.errorHandler,
			middlewareStack: []
		})
	}
}

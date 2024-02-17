import { z } from "zod"

interface CreateActionOpts {
	middleware?: () => Promise<boolean>
}

interface CreateActionOptsWithContext<Context> {
	middleware?: () => Promise<boolean>
	context?: () => Promise<Context>
}

class ActionBuilder {
	constructor(private readonly opts?: CreateActionOpts) {}

	execute<Data>(handler: () => Promise<Data>) {
		return async () => {
			const mwResponse = (await Promise.resolve(this.opts?.middleware?.())) ?? true

			if (!mwResponse) {
				throw new Error("Middleware failed")
			}

			const data = ((await handler()) ?? null) as Data

			return data
		}
	}

	input<InputSchema extends z.ZodSchema>(schema: InputSchema) {
		return new ActionBuilderWithInput<InputSchema>(schema, this.opts)
	}

	output<OutputSchema extends z.ZodSchema>(schema: OutputSchema) {
		return new ActionBuilderWithOutput<OutputSchema>(schema, this.opts)
	}
}

class ActionBuilderWithInput<InputSchema extends z.ZodSchema> {
	constructor(
		private readonly inputSchema: InputSchema,
		private readonly opts?: CreateActionOpts
	) {}

	execute<Data>(handler: (opts: { input: z.input<InputSchema> }) => Promise<Data>) {
		return async (input: z.input<InputSchema>) => {
			const parsedInput = this.inputSchema.safeParse(input)

			if (!parsedInput.success) {
				throw new Error("Invalid input")
			}

			const mwResponse = (await Promise.resolve(this.opts?.middleware?.())) ?? true

			if (!mwResponse) {
				throw new Error("Middleware failed")
			}

			const data = ((await handler({ input: parsedInput.data })) ?? null) as Data

			return data
		}
	}

	output<OutputSchema extends z.ZodSchema>(schema: OutputSchema) {
		return new ActionBuilderWithInputOutput<InputSchema, OutputSchema>(
			this.inputSchema,
			schema,
			this.opts
		)
	}
}

class ActionBuilderWithOutput<OutputSchema extends z.ZodSchema> {
	constructor(
		private readonly outputSchema: OutputSchema,
		private readonly opts?: CreateActionOpts
	) {}

	execute(handler: () => Promise<z.output<OutputSchema>>) {
		return async () => {
			const mwResponse = (await Promise.resolve(this.opts?.middleware?.())) ?? true

			if (!mwResponse) {
				throw new Error("Middleware failed")
			}

			const data = (await handler()) ?? null

			const parsedData = this.outputSchema.safeParse(data)

			if (!parsedData.success) {
				throw new Error("Invalid output")
			}

			return parsedData.data as z.output<OutputSchema>
		}
	}

	input<InputSchema extends z.ZodSchema>(schema: InputSchema) {
		return new ActionBuilderWithInputOutput<InputSchema, OutputSchema>(
			schema,
			this.outputSchema,
			this.opts
		)
	}
}

class ActionBuilderWithInputOutput<
	InputSchema extends z.ZodSchema,
	OutputSchema extends z.ZodSchema
> {
	constructor(
		private readonly inputSchema: InputSchema,
		private readonly outputSchema: OutputSchema,
		private readonly opts?: CreateActionOpts
	) {}

	execute(
		handler: (opts: { input: z.input<InputSchema> }) => Promise<z.output<OutputSchema>>
	) {
		return async (input: z.input<InputSchema>) => {
			const parsedInput = this.inputSchema.safeParse(input)

			if (!parsedInput.success) {
				throw new Error("Invalid input")
			}

			const mwResponse = (await Promise.resolve(this.opts?.middleware?.())) ?? true

			if (!mwResponse) {
				throw new Error("Middleware failed")
			}

			const data = (await handler({ input: parsedInput.data })) ?? null

			const parsedData = this.outputSchema.safeParse(data)

			if (!parsedData.success) {
				throw new Error("Invalid output")
			}

			return parsedData.data as z.output<OutputSchema>
		}
	}
}

class ActionBuilderWithContext<Context> {
	constructor(private readonly opts?: CreateActionOptsWithContext<Context>) {}

	execute<Data>(handler: (opts: { ctx: Context }) => Promise<Data>) {
		return async () => {
			const mwResponse = (await Promise.resolve(this.opts?.middleware?.())) ?? true

			if (!mwResponse) {
				throw new Error("Middleware failed")
			}

			const ctx = ((await this.opts?.context?.()) ?? null) as Context

			const data = ((await handler({ ctx })) ?? null) as Data

			return data
		}
	}

	input<InputSchema extends z.ZodSchema>(schema: InputSchema) {
		return new ActionBuilderWithContextInput<InputSchema, Context>(schema, this.opts)
	}

	output<OutputSchema extends z.ZodSchema>(schema: OutputSchema) {
		return new ActionBuilderWithContextOutput<OutputSchema, Context>(schema, this.opts)
	}
}

class ActionBuilderWithContextInput<InputSchema extends z.ZodSchema, Context> {
	constructor(
		private readonly inputSchema: InputSchema,
		private readonly opts?: CreateActionOptsWithContext<Context>
	) {}

	execute<Data>(
		handler: (opts: { input: z.input<InputSchema>; ctx: Context }) => Promise<Data>
	) {
		return async (input: z.input<InputSchema>) => {
			const parsedInput = this.inputSchema.safeParse(input)

			if (!parsedInput.success) {
				throw new Error("Invalid input")
			}

			const mwResponse = (await Promise.resolve(this.opts?.middleware?.())) ?? true

			if (!mwResponse) {
				throw new Error("Middleware failed")
			}

			const ctx = ((await this.opts?.context?.()) ?? null) as Context

			const data = ((await handler({ input: parsedInput.data, ctx })) ?? null) as Data

			return data
		}
	}

	output<OutputSchema extends z.ZodSchema>(schema: OutputSchema) {
		return new ActionBuilderWithContextInputOutput<InputSchema, OutputSchema, Context>(
			this.inputSchema,
			schema,
			this.opts
		)
	}
}

class ActionBuilderWithContextOutput<OutputSchema extends z.ZodSchema, Context> {
	constructor(
		private readonly outputSchema: OutputSchema,
		private readonly opts?: CreateActionOptsWithContext<Context>
	) {}

	execute(handler: (opts: { ctx: Context }) => Promise<z.output<OutputSchema>>) {
		return async () => {
			const mwResponse = (await Promise.resolve(this.opts?.middleware?.())) ?? true

			if (!mwResponse) {
				throw new Error("Middleware failed")
			}

			const ctx = ((await this.opts?.context?.()) ?? null) as Context

			const data = (await handler({ ctx })) ?? null

			const parsedData = this.outputSchema.safeParse(data)

			if (!parsedData.success) {
				throw new Error("Invalid output")
			}

			return parsedData.data as z.output<OutputSchema>
		}
	}

	input<InputSchema extends z.ZodSchema>(schema: InputSchema) {
		return new ActionBuilderWithContextInputOutput<InputSchema, OutputSchema, Context>(
			schema,
			this.outputSchema,
			this.opts
		)
	}
}

class ActionBuilderWithContextInputOutput<
	InputSchema extends z.ZodSchema,
	OutputSchema extends z.ZodSchema,
	Context
> {
	constructor(
		private readonly inputSchema: InputSchema,
		private readonly outputSchema: OutputSchema,
		private readonly opts?: CreateActionOptsWithContext<Context>
	) {}

	execute(
		handler: (opts: {
			input: z.input<InputSchema>
			ctx: Context
		}) => Promise<z.output<OutputSchema>>
	) {
		return async (input: z.input<InputSchema>) => {
			const parsedInput = this.inputSchema.safeParse(input)

			if (!parsedInput.success) {
				throw new Error("Invalid input")
			}

			const mwResponse = (await Promise.resolve(this.opts?.middleware?.())) ?? true

			if (!mwResponse) {
				throw new Error("Middleware failed")
			}

			const ctx = ((await this.opts?.context?.()) ?? null) as Context

			const data = (await handler({ input: parsedInput.data, ctx })) ?? null

			const parsedData = this.outputSchema.safeParse(data)

			if (!parsedData.success) {
				throw new Error("Invalid output")
			}

			return parsedData.data as z.output<OutputSchema>
		}
	}
}

class ActionBuilderRoot {
	create(opts?: CreateActionOpts) {
		return new ActionBuilder(opts)
	}

	createWithContext<Context>(opts?: CreateActionOptsWithContext<Context>) {
		return new ActionBuilderWithContext<Context>(opts)
	}
}

export const actionBuilder = new ActionBuilderRoot()

import { z } from "zod"

interface CreateActionOpts {
	/**
	 *
	 * Um middleware para rodar antes de executar a ação
	 * @returns Uma promise que deve resolver para um booleano
	 * */
	middleware?: () => Promise<boolean>
}

class ActionBuilder {
	/**
	 * @param opts Opções iniciais para a ação
	 * */
	constructor(private readonly opts?: CreateActionOpts) {}

	/**
	 * @param Um promise handler que será axecutado quando a ação for chamada
	 * @returns Uma função que pode ser chamada para executar a ação
	 * */
	query<Data>(handler: () => Promise<Data>) {
		return async () => {
			const mwResponse = (await Promise.resolve(this.opts?.middleware?.())) ?? true

			if (!mwResponse) {
				throw new Error("Middleware failed")
			}

			const data = ((await handler()) ?? null) as Data

			return data
		}
	}

	/**
	 * @param schema Adiciona como parser para a entrada da ação
	 * @returns Um builder para a ação com input parser
	 * */
	input<InputSchema extends z.ZodSchema>(schema: InputSchema) {
		return new ActionBuilderWithInput<InputSchema>(schema, this.opts)
	}

	/**
	 * @param schema Adiciona como parser para a saída da ação
	 * @returns Um builder para a ação com output parser
	 * */
	output<OutputSchema extends z.ZodSchema>(schema: OutputSchema) {
		return new ActionBuilderWithOutput<OutputSchema>(schema, this.opts)
	}
}

class ActionBuilderWithInput<InputSchema extends z.ZodSchema> {
	/**
	 * @param inputSchema Adiciona como parser para a entrada da ação
	 * @param opts Opções iniciais para a ação
	 * */
	constructor(
		private readonly inputSchema: InputSchema,
		private readonly opts?: CreateActionOpts
	) {}

	/**
	 * @param handler O handler para a ação com input parser
	 * @returns Uma função que pode ser chamada para executar a ação
	 * */
	query<Data>(handler: (opts: { input: z.input<InputSchema> }) => Promise<Data>) {
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

	/**
	 * @param schema Adiciona como parser para a saída da ação
	 * @returns Um builder para a ação com input e output parser
	 * */
	output<OutputSchema extends z.ZodSchema>(schema: OutputSchema) {
		return new ActionBuilderWithInputOutput<InputSchema, OutputSchema>(
			this.inputSchema,
			schema,
			this.opts
		)
	}
}

class ActionBuilderWithOutput<OutputSchema extends z.ZodSchema> {
	/**
	 * @param outputSchema Adiciona como parser para a saída da ação
	 * @param opts Opções iniciais para a ação
	 * */
	constructor(
		private readonly outputSchema: OutputSchema,
		private readonly opts?: CreateActionOpts
	) {}

	/**
	 * @param handler O handler para a ação com output parser
	 * @returns Uma função que pode ser chamada para executar a ação
	 * */
	query(handler: () => Promise<z.output<OutputSchema>>) {
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

	/**
	 * @param schema Adiciona como parser para a entrada da ação
	 * @returns Um builder para a ação com input e output parser
	 * */
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
	/**
	 * @param inputSchema O schema para a entrada
	 * @param outputSchema O schema para a saída
	 * @param opts Opções iniciais para a ação
	 * */
	constructor(
		private readonly inputSchema: InputSchema,
		private readonly outputSchema: OutputSchema,
		private readonly opts?: CreateActionOpts
	) {}

	/**
	 * @param handler O handler para a ação com input e output parser
	 * @returns Uma função que pode ser chamada para executar a ação
	 * */
	query(
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

/**
 * @param opts Opções iniciais para a ação
 * @returns Um builder para a ação
 * */
export const createAction = (opts?: CreateActionOpts) => {
	return new ActionBuilder(opts)
}

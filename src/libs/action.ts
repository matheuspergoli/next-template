interface ActionResultSuccess<T> {
	success: true
	data: {
		message: string
		result: T
	}
	status: number
}

interface ActionResultError {
	success: false
	error: {
		message: string
		cause: unknown
	}
	status: number
}

type ActionResult<T> = ActionResultSuccess<T> | ActionResultError

type Action<R, P = void> = (params: P) => Promise<ActionResult<R>>

export const createAction = <R, P = void>(action: Action<R, P>): Action<R, P> => {
	return async (params: P) => {
		try {
			const result = await action(params)
			return result
		} catch (error) {
			return {
				success: false,
				error: {
					cause: error,
					message: 'Internal Server Error'
				},
				status: 500
			}
		}
	}
}

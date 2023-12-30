import { Session } from 'next-auth'

import { getSession } from '@/libs/auth'
import { Either, left } from '@/libs/either'

interface ActionResultSuccess<T> {
	message: string
	data: T
}

interface ActionResultError {
	message: string
	cause: unknown
}

type ActionResult<T> = Either<ActionResultError, ActionResultSuccess<T>>

type Action<R, P = void> = (params: P) => Promise<ActionResult<R>>

export const createAction = <R, P = void>(action: Action<R, P>) => action

type AuthorizedAction<R, P = void> = (
	params: P,
	session: Session
) => Promise<ActionResult<R>>

export const createAuthorizedAction = <R, P = void>(action: AuthorizedAction<R, P>) => {
	return async (params: P) => {
		const session = await getSession()
		if (!session) {
			return left({
				message: 'Unauthorized',
				cause: null
			})
		}
		return action(params, session)
	}
}

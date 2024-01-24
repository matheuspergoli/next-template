import { Session } from 'next-auth'

import { getSession } from '@/shared/libs/auth'
import { Either, left } from '@/shared/libs/either'

interface ActionResultSuccess<S> {
	message: string
	data: S
}

interface ActionResultError<E = unknown> {
	message: string
	cause: E
}

type ActionResult<S, E = unknown> = Either<ActionResultError<E>, ActionResultSuccess<S>>

type Action<S, P = void, E = unknown> = (params: P) => Promise<ActionResult<S, E>>

export const createAction = <S, P = void, E = unknown>(action: Action<S, P, E>) => action

type AuthorizedAction<S, P = void, E = unknown> = (
	params: P,
	session: Session
) => Promise<ActionResult<S, E>>

export const createAuthorizedAction = <S, P = void, E = unknown>(
	action: AuthorizedAction<S, P, E>
) => {
	return async (params: P) => {
		const session = await getSession()
		if (!session) {
			return left({
				message: 'Não autorizado',
				cause: 'Sessão inválida'
			})
		}
		return action(params, session)
	}
}

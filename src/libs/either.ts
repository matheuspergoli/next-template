type Left<L> = {
	readonly tag: 'Left'
	readonly error: L
}

type Right<R> = {
	readonly tag: 'Right'
	readonly value: R
}

type Either<L, R> = Left<L> | Right<R>

const left = <L>(error: L): Left<L> => ({
	tag: 'Left',
	error
})

const right = <R>(value: R): Right<R> => ({
	tag: 'Right',
	value
})

const isLeft = <L, R>(either: Either<L, R>): either is Left<L> => either.tag === 'Left'

const isRight = <L, R>(either: Either<L, R>): either is Right<R> => either.tag === 'Right'

export { left, right, type Either, isLeft, isRight }

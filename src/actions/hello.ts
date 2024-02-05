"use server"

import { Either, right } from "@/libs/either"

export const hello = (message: string): Either<never, string> => {
	return right(`Hello ${message}`)
}

"use server"

import { isLeft, left, right } from "@/libs/either"
import { createHttpClient } from "@/libs/network"

const http = createHttpClient({ baseURL: "https://jsonplaceholder.typicode.com" })

interface User {
	id: number
	name: string
	username: string
}

const random = () => Math.floor(Math.random() * 10) + 1

export const serverAction = async () => {
	try {
		const response = await http.get<User>({ url: `/users/${random()}` })

		if (isLeft(response)) {
			return left(response.error)
		}

		return right(response.value.data)
	} catch (error) {
		return left(error)
	}
}

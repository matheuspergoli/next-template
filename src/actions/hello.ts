'use server'

import { createAction } from '@/libs/action'
import { left, right } from '@/libs/either'

export const hello = createAction(async (params: { message: string }) => {
	try {
		return right({
			message: 'Success',
			data: `Hello ${params.message}`
		})
	} catch (error) {
		return left({
			message: 'Internal Server Error',
			cause: error
		})
	}
})

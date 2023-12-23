'use server'

import { createAction } from '@/libs/action'

export const hello = createAction(async (params: { message: string }) => {
	try {
		return {
			success: true,
			data: {
				message: 'Success',
				result: `Hello ${params.message}`
			},
			status: 200
		}
	} catch (error) {
		return {
			success: false,
			error: {
				message: 'Error sending message',
				cause: error
			},
			status: 500
		}
	}
})

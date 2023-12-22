'use server'

import { createAction } from '@/libs/action'

export const hello = createAction(async (params: { message: string }) => {
	try {
		return { success: true, data: `Hello ${params.message}`, status: 200 }
	} catch (error) {
		return { success: false, error, status: 500 }
	}
})

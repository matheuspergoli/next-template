'use server'

import { createAction } from '@/libs/action'

export const hello = createAction(async (params: { message: string }) => {
	return { success: true, data: `Hello ${params.message}`, status: 200 }
})

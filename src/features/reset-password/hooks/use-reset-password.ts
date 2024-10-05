import React from "react"

import { toast } from "sonner"

import { resetPassword } from "@/server/actions/reset-password"

export const useResetPassword = () => {
	const [isPending, startTransition] = React.useTransition()

	const resetUserPassword = async (data: {
		password: string
		verificationToken: string
	}) => {
		startTransition(async () => {
			const { error } = await resetPassword(data)

			if (error) {
				toast.error(error.message)
				return
			}

			toast.success("Password reset successful")
		})
	}

	return {
		isPending,
		resetUserPassword
	}
}

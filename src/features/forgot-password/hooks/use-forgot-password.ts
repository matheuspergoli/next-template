import React from "react"

import { toast } from "sonner"

import { sendPasswordResetToken } from "@/server/actions/send-password-reset-token"

import type { ForgotPasswordSchemaData } from "../schemas/forgot-password-schema"

export const useForgotPassword = () => {
	const [isPending, startTransition] = React.useTransition()

	const forgotPassword = async (data: ForgotPasswordSchemaData) => {
		startTransition(async () => {
			const { error } = await sendPasswordResetToken(data)

			if (error) {
				toast.error(error.message)
				return
			}

			toast.success("Password reset email sent")
		})
	}

	return {
		isPending,
		forgotPassword
	}
}

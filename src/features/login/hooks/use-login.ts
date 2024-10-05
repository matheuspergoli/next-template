import React from "react"

import { toast } from "sonner"

import { loginWithEmailAndPassword } from "@/server/actions/login-with-email-and-password"

import type { LoginSchemaData } from "../schemas/login-schema"

export const useLogin = () => {
	const [isPending, startTransition] = React.useTransition()

	const login = async (data: LoginSchemaData) => {
		startTransition(async () => {
			const { error } = await loginWithEmailAndPassword(data)

			if (error) {
				toast.error(error.message)
				return
			}

			toast.success("Login successful")
		})
	}

	return {
		isPending,
		login
	}
}

import React from "react"

import { toast } from "sonner"

import { signupWithEmailAndPassword } from "@/server/actions/signup-with-email-and-password"

import type { RegisterSchemaData } from "../schemas/register-schema"

export const useRegister = () => {
	const [isPending, startTransition] = React.useTransition()

	const signup = async (data: RegisterSchemaData) => {
		startTransition(async () => {
			const { error } = await signupWithEmailAndPassword(data)

			if (error) {
				toast.error(error.message)
				return
			}

			toast.success("Signup successful")
		})
	}

	return {
		isPending,
		signup
	}
}

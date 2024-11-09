"use client"

import { api } from "@/shared/trpc/client"
import { Button } from "@/shared/ui/button"

export default function Home() {
	const utils = api.useUtils()

	const { mutate } = api.auth.signup.useMutation({
		onSuccess: async () => {
			await utils.user.invalidate()
		}
	})

	const { data } = api.user.getCurrentUser.useQuery()

	return (
		<main>
			<h1>Hello World!</h1>
			{data ? <p>Logged in as {data.email}</p> : null}
			<Button
				onClick={() => mutate({ email: "test@email.com", password: "Zapeado.123" })}>
				Signup
			</Button>
		</main>
	)
}

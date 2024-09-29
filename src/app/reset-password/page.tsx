import { ResetPasswordCard } from "@/features/reset-password"
import { AuthLayout } from "@/shared/layouts/auth-layout"
import { routes } from "@/shared/navigation/routes"

interface Params {
	searchParams: unknown
}

export default function Page({ searchParams }: Params) {
	const { token } = routes.resetPassword.$parseSearchParams(searchParams)
	console.log(token)

	return (
		<AuthLayout>
			<ResetPasswordCard />
		</AuthLayout>
	)
}

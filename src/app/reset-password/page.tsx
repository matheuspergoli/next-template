import { ResetPasswordCard } from "@/features/reset-password"
import { BaseLayout } from "@/shared/layouts/base-layout"
import { routes } from "@/shared/navigation/routes"

interface Params {
	searchParams: unknown
}

export default function Page({ searchParams }: Params) {
	const { token } = routes.resetPassword.$parseSearchParams(searchParams)
	console.log(token)

	return (
		<BaseLayout>
			<ResetPasswordCard />
		</BaseLayout>
	)
}

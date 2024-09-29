import { ForgotPasswordCard } from "@/features/forgot-password"
import { AuthLayout } from "@/shared/layouts/auth-layout"

export default function Page() {
	return (
		<AuthLayout>
			<ForgotPasswordCard />
		</AuthLayout>
	)
}

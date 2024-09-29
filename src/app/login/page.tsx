import { LoginCard } from "@/features/login"
import { AuthLayout } from "@/shared/layouts/auth-layout"

export default function Page() {
	return (
		<AuthLayout>
			<LoginCard />
		</AuthLayout>
	)
}

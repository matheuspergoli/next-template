import { RegisterCard } from "@/features/register"
import { AuthLayout } from "@/shared/layouts/auth-layout"

export default function Page() {
	return (
		<AuthLayout>
			<RegisterCard />
		</AuthLayout>
	)
}

import Link from "next/link"

import { LockIcon } from "lucide-react"

import { routes } from "../navigation/routes"

export const ForbiddenBanner = () => {
	return (
		<div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-md text-center">
				<LockIcon className="mx-auto h-12 w-12 text-primary" />
				<h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
					Access Denied
				</h1>
				<p className="mt-4 text-muted-foreground">
					You don&apos;t have permission to access the requested page. Please contact your
					administrator or go back to the homepage.
				</p>
				<div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href={routes.home()}
						className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
						prefetch={false}>
						Go to Homepage
					</Link>
					<Link
						href={routes.home()}
						className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						prefetch={false}>
						Contact Support
					</Link>
				</div>
			</div>
		</div>
	)
}

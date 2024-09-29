import type React from "react"
import Link from "next/link"

import {
	ChartNoAxesColumnIncreasing,
	HomeIcon,
	RocketIcon,
	SettingsIcon,
	Shield
} from "lucide-react"

import { getCurrentUser } from "@/libs/session"
import { logout } from "@/server/actions/logout"
import { routes } from "@/shared/navigation/routes"
import { Button } from "@/shared/ui/button"

export const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
	const user = await getCurrentUser()

	return (
		<main className="grid grid-cols-[280px_1fr] gap-10">
			<section className="sticky top-0 flex h-screen flex-col justify-between gap-3 border-r p-3">
				<div className="flex flex-col gap-20">
					<Link href={routes.home()}>
						<h1 className="flex items-center gap-3 text-xl font-bold">
							<RocketIcon className="h-8 w-8" />
							Acme Inc
						</h1>
					</Link>

					<div className="flex flex-col gap-3">
						<Button asChild variant="outline">
							<Link href={routes.home()}>
								<HomeIcon className="mr-2 h-4 w-4" />
								Home
							</Link>
						</Button>

						<Button asChild variant="outline">
							<Link href={routes.dashboard()}>
								<ChartNoAxesColumnIncreasing className="mr-2 h-4 w-4" />
								Dashboard
							</Link>
						</Button>

						<Button asChild variant="outline">
							<Link href={routes.dashboardGeneral()}>
								<SettingsIcon className="mr-2 h-4 w-4" />
								General
							</Link>
						</Button>

						<Button asChild variant="outline">
							<Link href={routes.dashboardSecurity()}>
								<Shield className="mr-2 h-4 w-4" />
								Security
							</Link>
						</Button>
					</div>
				</div>

				<div className="border-t">
					<p className="w-full overflow-hidden text-ellipsis text-sm font-semibold leading-5">
						{user?.username}
					</p>
					<p className="w-full overflow-hidden text-ellipsis text-sm leading-5 text-muted-foreground">
						{user?.email}
					</p>

					<form
						className="mt-5"
						action={async () => {
							"use server"
							await logout()
						}}>
						<Button className="w-full">Logout</Button>
					</form>
				</div>
			</section>

			<section>
				<div>{children}</div>
			</section>
		</main>
	)
}

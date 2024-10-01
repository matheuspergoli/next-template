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

import { ForbiddenBanner } from "../banners/forbidden-banner"
import { AutoBreadcrumb } from "../components/auto-breadcrumbs"
import { ThemeMode } from "../components/theme-mode"
import { Separator } from "../ui/separator"

export const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
	const user = await getCurrentUser()

	if (!user?.id) {
		return <ForbiddenBanner />
	}

	return (
		<main className="grid h-screen grid-cols-[300px_1fr] grid-rows-[70px_1fr] gap-3 p-3">
			<section className="flex items-center rounded-md border p-3">
				<Link href={routes.home()}>
					<h1 className="flex items-center gap-3 text-lg font-semibold">
						<RocketIcon className="h-5 w-5" />
						Acme Inc
					</h1>
				</Link>
			</section>

			<section className="flex items-center rounded-md border p-3">
				<AutoBreadcrumb />
			</section>

			<section className="flex flex-col justify-between rounded-md border p-3">
				<div className="flex flex-col">
					<Button asChild variant="ghost" className="justify-start gap-3">
						<Link href={routes.home()}>
							<HomeIcon className="h-5 w-5" />
							Home
						</Link>
					</Button>

					<Button asChild variant="ghost" className="justify-start gap-3">
						<Link href={routes.dashboard()}>
							<ChartNoAxesColumnIncreasing className="h-5 w-5" />
							Dashboard
						</Link>
					</Button>

					<Button asChild variant="ghost" className="justify-start gap-3">
						<Link href={routes.dashboardGeneral()}>
							<SettingsIcon className="h-5 w-5" />
							General
						</Link>
					</Button>

					<Button asChild variant="ghost" className="justify-start gap-3">
						<Link href={routes.dashboardSecurity()}>
							<Shield className="h-5 w-5" />
							Security
						</Link>
					</Button>
				</div>

				<div className="flex flex-col gap-3">
					<div>
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
					<Separator className="my-4" />
					<div className="flex items-center justify-between gap-3">
						<ThemeMode />
						<p className="text-sm text-muted-foreground">
							Acme Inc &copy; {new Date().getFullYear()}
						</p>
					</div>
				</div>
			</section>

			<section className="no-scrollbar overflow-y-scroll rounded-md border p-3">
				{children}
			</section>
		</main>
	)
}
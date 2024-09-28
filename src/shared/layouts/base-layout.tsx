import type React from "react"
import Link from "next/link"

import { RocketIcon } from "@radix-ui/react-icons"

import { routes } from "../navigation/routes"

export const BaseLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="grid h-screen grid-cols-1 place-content-center lg:grid-cols-2">
			<section className="hidden h-screen flex-col justify-between bg-muted/70 p-5 lg:flex">
				<Link href={routes.home()}>
					<h1 className="flex items-center gap-3 text-xl font-bold">
						<RocketIcon className="h-8 w-8" />
						Acme Inc
					</h1>
				</Link>
				<p className="text-xl font-semibold text-foreground">
					&quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
					tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
					quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
					consequat.&quot;
				</p>
			</section>

			<section className="flex items-center justify-center px-3">{children}</section>
		</main>
	)
}

import type React from "react"
import Link from "next/link"

import { RocketIcon } from "@radix-ui/react-icons"
import { ArrowLeft } from "lucide-react"

import { routes } from "../navigation/routes"
import { Button } from "../ui/button"

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="relative grid h-screen grid-cols-1 place-content-center lg:grid-cols-2">
			<section className="hidden h-screen flex-col justify-between bg-muted/70 p-5 lg:flex">
				<div className="flex items-center justify-between">
					<Link href={routes.home()}>
						<h1 className="flex items-center gap-3 text-xl font-bold">
							<RocketIcon className="h-8 w-8" />
							Acme Inc
						</h1>
					</Link>

					<Button variant="ghost" asChild className="text-white">
						<Link href={routes.home()}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Home
						</Link>
					</Button>
				</div>
				<p className="text-xl font-semibold text-foreground">
					&quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
					tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
					quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
					consequat.&quot;
				</p>
			</section>

			<Button
				asChild
				variant="ghost"
				className="absolute right-5 top-5 w-fit text-white lg:hidden">
				<Link href={routes.home()}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Home
				</Link>
			</Button>
			<section className="flex items-center justify-center px-3">{children}</section>
		</main>
	)
}

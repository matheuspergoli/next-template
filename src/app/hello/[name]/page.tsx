"use client"

import { Routes } from "@/shared/routes"

interface PageProps {
	params: typeof Routes.hello.params
}

export default function Page({ params }: PageProps) {
	const searchParams = Routes.hello.useSearchParams()

	return (
		<main className="container mt-10">
			<h1 className="font-bold">
				Hello {params.name} {searchParams.surname}
			</h1>
		</main>
	)
}

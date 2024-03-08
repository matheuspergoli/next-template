import { Routes } from "@/shared/navigation/routes"

interface PageProps {
	params?: unknown
	searchParams?: unknown
}

export default function Page({ params, searchParams }: PageProps) {
	const { surname } = Routes.hello.parseSearchParams(searchParams)
	const { name } = Routes.hello.parseParams(params)

	return (
		<main className="container mt-10">
			<h1 className="text-center text-2xl font-bold">
				Hello, {name} {surname} !
			</h1>
		</main>
	)
}

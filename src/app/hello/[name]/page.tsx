import { hello } from "@/actions/hello"
import { isRight } from "@/libs/either"
import { Routes } from "@/shared/navigation/routes"

interface PageProps {
	params?: unknown
	searchParams?: unknown
}

export default function Page({ params, searchParams }: PageProps) {
	const { surname } = Routes.hello.parseSearchParams(searchParams)
	const { name } = Routes.hello.parseParams(params)

	const message = hello(`${name} ${surname}`)

	return (
		<main className="container mt-10">
			<h1 className="font-bold">{isRight(message) && message.value}</h1>
		</main>
	)
}

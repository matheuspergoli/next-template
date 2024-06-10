import { run } from "@/libs/utils"
import { userActions } from "@/server/routes/user"
import { BlurImage } from "@/shared/components/blur-image"
import { Badge } from "@/shared/ui/badge"

const randomNumber = () => Math.floor(Math.random() * 10) + 1

export default async function Page() {
	const user = await userActions.getById({ id: randomNumber() })
	const users = await userActions.getAll()
	const admin = await userActions.getAdmin()

	return (
		<main className="container mx-auto mt-20 flex flex-col items-center justify-center gap-10">
			<Badge className="text-sm">Next.js 14 ⚡App Router</Badge>

			<section className="space-y-2 text-center">
				<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
					Next.js 14 Template
				</h1>
				<p className="text-gray-500 md:text-xl">
					Created by{" "}
					<a
						href="https://github.com/matheuspergoli"
						target="_blank"
						rel="noopener noreferrer"
						className="underline">
						Matheus Pergoli
					</a>{" "}
					for personal use. Feel free to use it
				</p>
			</section>

			<section>
				<pre className="text-center">👇 server action response 👇</pre>
				{run(() => {
					if (user.success) {
						return <pre className="text-center">{JSON.stringify(user.data, null, 2)}</pre>
					}

					if (users.success) {
						return (
							<pre className="text-center">{JSON.stringify(users.data, null, 2)}</pre>
						)
					}

					if (admin.success) {
						return (
							<pre className="text-center">{JSON.stringify(admin.data, null, 2)}</pre>
						)
					}

					return <pre className="text-center">Loading...</pre>
				})}
			</section>

			<figure className="overflow-hidden rounded-lg border">
				<BlurImage
					width={400}
					height={400}
					alt="Blurhash"
					src={"https://avatars.githubusercontent.com/u/14985020?v=4"}
					placeholder="blur"
					className="w-60 rounded-lg"
				/>
			</figure>
		</main>
	)
}

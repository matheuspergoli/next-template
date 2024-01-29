import { hello } from "@/actions/hello"
import { isRight } from "@/libs/either"
import { placeholderBlurhash } from "@/libs/utils"
import { BlurImage } from "@/shared/components/blur-image"

export default async function Page() {
	const message = await hello({ message: "from Server Action" })

	return (
		<main className="container mx-auto mt-40 flex flex-col items-center justify-center gap-10">
			<section className="space-y-2 text-center">
				<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
					Next.js 14 Template
				</h1>
				<p className="text-gray-500 md:text-xl">
					Created by <span className="underline">Matheus Pergoli</span> for personal use.
					Feel free to use it
				</p>
			</section>

			{isRight(message) && <p className="text-xl">{message.value.data}</p>}

			<figure className="overflow-hidden rounded-lg">
				<BlurImage
					width={400}
					height={400}
					alt="Blurhash"
					src={"https://avatars.githubusercontent.com/u/14985020?v=4"}
					placeholder="blur"
					blurDataURL={placeholderBlurhash}
					className="w-60 rounded-lg"
				/>
			</figure>
		</main>
	)
}

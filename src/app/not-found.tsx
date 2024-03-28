import { BlurImage } from "@/shared/components/blur-image"

export default function NotFound() {
	return (
		<div className="container mx-auto my-20 flex flex-col items-center justify-center">
			<h1 className="text-4xl font-bold">404</h1>
			<p className="text-xl font-medium">Página não encontrada</p>
			<BlurImage
				alt="missing site"
				src="https://illustrations.popsy.co/gray/timed-out-error.svg"
				placeholder="blur"
				width={400}
				height={400}
			/>
		</div>
	)
}

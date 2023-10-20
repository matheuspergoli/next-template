import React from 'react'
import { placeholderBlurhash } from '@/libs/utils'
import { ThemeMode } from '@/shared/components/theme-mode'
import { BlurImage } from '@/shared/components/blur-image'

export default function Page() {
	return (
		<main className='flex h-screen w-screen flex-col items-center justify-center'>
			<section className='flex flex-col items-center'>
				<h1 className='text-2xl font-semibold'>Hello World</h1>
				<p>NextJS 13 App Router</p>
			</section>

			<section className='my-10 flex items-center justify-center'>
				<ThemeMode />
			</section>

			<figure className='h-44 w-full max-w-md overflow-hidden rounded-md'>
				<BlurImage
					width={500}
					height={500}
					alt='Blurhash'
					src={'https://placehold.co/500x500/png?text=NextJS+13+App+Router&font=roboto'}
					placeholder='blur'
					blurDataURL={placeholderBlurhash}
					className='h-full w-full rounded-md object-cover'
				/>
			</figure>
		</main>
	)
}

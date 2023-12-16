import React from 'react'

import { placeholderBlurhash } from '@/libs/utils'
import { BlurImage } from '@/shared/components/blur-image'
import { ThemeMode } from '@/shared/components/theme-mode'

export default function Page() {
	return (
		<main className='flex h-screen w-screen flex-col items-center justify-center'>
			<section className='flex flex-col items-center'>
				<h1 className='text-2xl font-semibold'>Next.js 14 Template</h1>
				<p>by Matheus Pergoli</p>
			</section>

			<section className='my-10 flex items-center justify-center'>
				<ThemeMode />
			</section>

			<figure className='h-44 w-full max-w-md overflow-hidden rounded-md'>
				<BlurImage
					width={500}
					height={500}
					alt='Blurhash'
					src={'https://placehold.co/500x500/png?text=Next.js+14+App+Router&font=roboto'}
					placeholder='blur'
					blurDataURL={placeholderBlurhash}
					className='h-full w-full rounded-md object-cover'
				/>
			</figure>
		</main>
	)
}

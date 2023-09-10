'use client'

import React from 'react'
import { Button } from '@/shared/ui/button'
import { placeholderBlurhash } from '@libs/utils'
import { BlurImage } from '@/shared/components/blur-image'

export default function Page() {
	const [count, setCount] = React.useState(0)

	return (
		<main className='flex h-screen w-screen flex-col items-center justify-center bg-zinc-800'>
			<section className='flex flex-col items-center text-white'>
				<h1 className='text-2xl font-semibold'>Hello World</h1>
				<p>NextJS 13 App Router</p>
				<Button
					variant='secondary'
					className='mb-10 mt-5 font-bold'
					onClick={() => setCount((prev) => prev + 1)}>
					Count is: {count}
				</Button>
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

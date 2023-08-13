'use client'

import React from 'react'

export default function Page() {
	const [count, setCount] = React.useState(0)

	return (
		<main className='flex h-screen w-screen items-center justify-center bg-zinc-800'>
			<section className='flex flex-col items-center text-white'>
				<h1 className='text-2xl font-semibold'>Hello World</h1>
				<p>NextJS 13 App Router</p>
				<button
					onClick={() => setCount((prev) => prev + 1)}
					className='mt-5 rounded-md bg-blue-600 px-3 py-2'>
					Count is: {count}
				</button>
			</section>
		</main>
	)
}

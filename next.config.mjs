await import('./naming-convention.mjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['placehold.co']
	}
}

export default nextConfig

await import('./naming-convention.mjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'placehold.co'
			}
		]
	}
}

export default nextConfig

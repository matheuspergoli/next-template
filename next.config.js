/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	logging: {
		fetches: {
			fullUrl: true
		}
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'placehold.co'
			}
		]
	}
}

module.exports = nextConfig

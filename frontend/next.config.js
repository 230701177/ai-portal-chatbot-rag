/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/ai-portal-chatbot-rag',
  assetPrefix: '/ai-portal-chatbot-rag/',
}

module.exports = nextConfig

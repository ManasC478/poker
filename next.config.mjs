/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure docs/api.md is bundled with the /api/docs serverless function,
  // which reads it from disk at request time.
  outputFileTracingIncludes: {
    "/api/docs": ["./docs/api.md"],
  },
}

export default nextConfig

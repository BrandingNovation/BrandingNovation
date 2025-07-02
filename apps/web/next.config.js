/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  poweredByHeader: false,
  trailingSlash: true,
  distDir: 'out',
};

module.exports = nextConfig;
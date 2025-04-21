/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['next/server'],
  },
  
  // Ignore ESLint errors during production build
  eslint: {
    // Warning instead of error during build
    ignoreDuringBuilds: true,
  },
  
  // Ignore TypeScript errors during production build (if needed)
  typescript: {
    // Warning instead of error during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig; 
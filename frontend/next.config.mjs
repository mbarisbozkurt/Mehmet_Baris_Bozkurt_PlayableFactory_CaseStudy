/** @type {import('next').NextConfig} */
const apiBase = process.env.NEXT_PUBLIC_API_BASE ? new URL(process.env.NEXT_PUBLIC_API_BASE).hostname : undefined;

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      // Allow optimized images served from our backend (Render URL)
      ...(apiBase ? [
        { protocol: 'https', hostname: apiBase },
        { protocol: 'http', hostname: apiBase },
      ] : []),
    ],
  },
};

export default nextConfig;
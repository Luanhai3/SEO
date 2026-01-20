import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Avatar
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Ảnh demo/placeholder
      },
    ],
  },
};

export default nextConfig;

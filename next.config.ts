import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'res.cloudinary.com',
      },
      {
        hostname: 'api.sandbox.midtrans.com',
      },
    ],
  },
};

export default nextConfig;

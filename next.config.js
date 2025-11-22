/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for development to enable API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async headers() {
    return [
      {
        // Apply to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? 'http://localhost:8000'
              // ? 'https://attendance.veritas.edu.ng'
              // ? 'https://testexeat.veritas.edu.ng'

              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Referer,User-Agent',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

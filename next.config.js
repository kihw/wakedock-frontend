/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental options are not needed for Next.js 14+
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Output configuration for Docker compatibility
  output: 'standalone',
  
  // Server configuration
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
      // WebSocket rewrites don't work in Next.js, use direct proxy instead
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    NEXT_PUBLIC_WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000',
  },

  // Image optimization
  images: {
    domains: [],
    unoptimized: false,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Performance optimizations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Compression and optimization
  compress: true,
  
  // Power optimizations
  poweredByHeader: false,
  
  // Static file serving
  trailingSlash: false,
};

module.exports = nextConfig;
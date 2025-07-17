/** @type {import('next').NextConfig} */
const nextConfig = {
  // v0.6.4 Optimizations for Next.js 14+

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },

  // Output configuration for Docker compatibility
  output: 'standalone',

  // Compression and optimization
  compress: true,
  swcMinify: true,

  // Power optimizations
  poweredByHeader: false,

  // Static file serving
  trailingSlash: false,

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
      'zustand'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

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
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle analyzer configuration
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const BundleAnalyzerPlugin = require('@next/bundle-analyzer')({
          enabled: process.env.ANALYZE === 'true',
        });
        config.plugins.push(BundleAnalyzerPlugin);
      }

      // Performance optimizations
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }

      // Optimize chunk splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };

      return config;
    },
  }),

  // Headers for security and performance
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
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
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
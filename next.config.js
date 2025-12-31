/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-ready TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Always check TypeScript in production
  },
  
  // Image optimization for production
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dxlka5esd/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Production-ready ESLint configuration
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint for production builds
    dirs: ['src'],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  
  // Server external packages (moved from experimental in Next.js 15)
  serverExternalPackages: ['postgres', 'drizzle-orm'],
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
  
  webpack: (config, { isServer, dev }) => {
    // Fixes for potential webpack issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        perf_hooks: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
      };

      // Optimize chunk loading for production
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            minSize: 20000,
            maxSize: 244000,
            cacheGroups: {
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: -10,
                chunks: 'all',
              },
              admin: {
                test: /[\\/]src[\\/]components[\\/]admin[\\/]/,
                name: 'admin',
                chunks: 'all',
                priority: 5,
              },
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                chunks: 'all',
                priority: 20,
              },
              ui: {
                test: /[\\/]node_modules[\\/](@headlessui|@heroicons)[\\/]/,
                name: 'ui',
                chunks: 'all',
                priority: 15,
              },
            },
          },
        };
      }
    }
    
    // Optimize for production builds
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    return config;
  },
}

module.exports = nextConfig

// next.config.mjs
export default {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/admin/dashboard/:schoolSlug',
          destination: '/admin/:schoolSlug',
        },
        {
          source: '/admin/dashboard/:schoolSlug/:path*',
          destination: '/admin/:schoolSlug/:path*',
        },
        {
          // Exclude Auth0 routes from being proxied to Rails
          source: '/api/((?!auth).*)',
          destination: 'http://127.0.0.1:4000/api/:1*',
        },
      ],
      fallback: [
        {
          source: '/parent/school/:school_slug',
          destination: '/parent/:school_slug',
        },
      ],
    };
  },
};

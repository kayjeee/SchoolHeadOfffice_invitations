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
          source: '/api/:path*',
          destination: 'http://127.0.0.1:4000/api/:path*',
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

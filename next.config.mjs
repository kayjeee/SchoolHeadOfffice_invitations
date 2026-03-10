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
    return [
      {
        source: '/parent/school/:school_slug',
        destination: '/parent/:school_slug',
      },
    ];
  },
};

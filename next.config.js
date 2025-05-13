/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // maybe change
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/COPIES', '**/_old/**']
    }
    return config
  },
  // Add these options for more verbose logging
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  // Configure trailing slashes
  trailingSlash: false,
  // Ensure 404 pages are correctly handled
  images: {
    domains: [],
  },
  // Add redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
      // {
      //   source: '/practice',
      //   destination: '/app/practice',
      //   permanent: false,
      // },
      // {
      //   source: '/practice/:id',
      //   destination: '/app/practice/:id',
      //   permanent: false,
      // }
    ]
  },
  // Enable App Router for specific paths
  // experimental: {
  //   appDir: true,
  // }
};

module.exports = nextConfig;

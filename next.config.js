/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Application is served under a sub-path in production (e.g. https://meu-dominio.com/tasks)
  // Make sure to set NEXT_PUBLIC_BASE_PATH to the same value in your environment (.env.local)
  basePath: '/tasks',
};

module.exports = nextConfig;

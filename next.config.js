/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Application is served under a sub-path in production (e.g. https://meu-dominio.com/tasks)

};

module.exports = nextConfig;

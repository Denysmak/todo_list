/** @type {import('next').NextConfig} */
const nextConfig = {
  // Define que o app roda dentro deste caminho
  basePath: '/tasks',
  
  // Opcional: Força a barra no final (ex: /tasks/dashboard/)
  // Ajuda em alguns casos de SEO e roteamento estrito
  trailingSlash: true, 

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
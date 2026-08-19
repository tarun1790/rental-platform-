const isGithubPages = process.env.NODE_ENV === 'production';
const repoName = 'rental-platform-';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  basePath: isGithubPages ? `/${repoName}` : '',
  assetPrefix: isGithubPages ? `/${repoName}/` : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'plus.unsplash.com', 'maps.googleapis.com'],
  },
};

export default nextConfig;

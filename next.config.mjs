const isGithubPages = process.env.GITHUB_PAGES === 'true' || process.env.DEPLOY_TARGET === 'gh-pages';
const isStandalone = process.env.STANDALONE_BUILD === 'true' || process.env.DOCKER_BUILD === 'true' || (!isGithubPages && process.env.NODE_ENV === 'production');
const repoName = 'rental-platform-';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  ...(isGithubPages
    ? {
        output: 'export',
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
        trailingSlash: true,
      }
    : isStandalone
    ? {
        output: 'standalone',
      }
    : {}),
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'plus.unsplash.com', 'maps.googleapis.com'],
  },
};

export default nextConfig;

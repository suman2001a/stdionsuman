import type { NextConfig } from 'next'; 

// Dynamically set basePath for GitHub pages to fix image/css paths
const isGithubActions = process.env.GITHUB_ACTIONS || false;
const repo = 'stdionsuman';
const basePath = isGithubActions ? `/${repo}` : '';

const nextConfig: NextConfig = { 
  output: 'export',
  images: { unoptimized: true },
  basePath: basePath,
}; 
export default nextConfig;

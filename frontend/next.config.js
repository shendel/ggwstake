/** @type {import('next').NextConfig} */

const nextConfig = {
  distDir: 'build',
  basePath: (process.env.NODE_ENV == 'production') ? '/_NEXT_GEN_APP' : undefined,
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
    CHAIN_ID: 97,
    CONTRACT: '0x3A5f1F772209C597425e2DE0987D77B6c0a7e2B2',
    TITLE: "GGWStake",
    SEO_DESC: "GGWStake",
    NEXT_PUBLIC_PROJECT_ID: "b87a3c44755d7f346d350330ca573223"
  }
}

module.exports = nextConfig

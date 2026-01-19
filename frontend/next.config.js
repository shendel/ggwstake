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
    CONTRACT: '0x20dFe3930bD176D22a4678aACbB64D04ea5EF6c4',
    TITLE: "GGWStake",
    SEO_DESC: "GGWStake",
    NEXT_PUBLIC_PROJECT_ID: "b87a3c44755d7f346d350330ca573223"
  }
}

module.exports = nextConfig

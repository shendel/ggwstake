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
    CHAIN_ID: 56,
    CONTRACT: '0x3E55901F6Cc424Acb9169593a42D0EBf6322171D', /*'0xD034df3BA4222cBcaeF1f83Cd5171aC1A3a06966',*/
    TITLE: "GGWStake",
    SEO_DESC: "GGWStake",
    NEXT_PUBLIC_PROJECT_ID: "b87a3c44755d7f346d350330ca573223",
    LOCK_MONTHS_OPTIONS: [
      { value: 1, title: '1 Month' },
      { value: 6, title: '6 Months' },
      { value: 12, title: '1 year' }
    ]
  }
}

module.exports = nextConfig

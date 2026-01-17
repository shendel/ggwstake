import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const { NEXT_PUBLIC_PROJECT_ID } = publicRuntimeConfig

export const TITLE = publicRuntimeConfig?.TITLE || 'GGW Stake'
export const SEO_DESC = publicRuntimeConfig?.SEO_DESC || ""

export const MAINNET_CHAIN_ID = publicRuntimeConfig?.CHAIN_ID || 97
export const MAINNET_CONTRACT = publicRuntimeConfig?.CONTRACT || '0x3A5f1F772209C597425e2DE0987D77B6c0a7e2B2'


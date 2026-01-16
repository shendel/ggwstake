import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const { NEXT_PUBLIC_PROJECT_ID } = publicRuntimeConfig

export const TITLE = publicRuntimeConfig?.TITLE || 'GGW Stake'
export const SEO_DESC = publicRuntimeConfig?.SEO_DESC || ""

export const MAINNET_CHAIN_ID = publicRuntimeConfig?.CHAIN_ID || 97
export const MAINNET_CONTRACT = publicRuntimeConfig?.CONTRACT || '0x...'


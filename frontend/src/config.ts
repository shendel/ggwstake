import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const { NEXT_PUBLIC_PROJECT_ID } = publicRuntimeConfig

export const TITLE = publicRuntimeConfig?.TITLE || 'GGW Stake'
export const SEO_DESC = publicRuntimeConfig?.SEO_DESC || ""

export const MAINNET_CHAIN_ID = publicRuntimeConfig?.CHAIN_ID || 97
export const MAINNET_CONTRACT = publicRuntimeConfig?.CONTRACT || '0xD034df3BA4222cBcaeF1f83Cd5171aC1A3a06966'

export const LOCK_MONTHS_OPTIONS = publicRuntimeConfig?.LOCK_MONTHS_OPTIONS || [
  { value: 1, title: '1 Month' },
  { value: 6, title: '6 Months' },
  { value: 12, title: '1 year' }
]

export const HEADER_MENU = publicRuntimeConfig?.HEADER_MENU || [
  {
    title: 'Home',
    url: '/',
    blank: true
  },
]
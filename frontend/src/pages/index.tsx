import type { AppProps } from "next/app"
import Head from 'next/head'
import getConfig from 'next/config'


import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import AppRootWrapper from '@/components/AppRootWrapper'
import GGWStakeView from '@/views/'
import StakeProvider from '@/contexts/StakeContext'

import {
  TITLE,
  SEO_DESC,
  MAINNET_CHAIN_ID,
  MAINNET_CONTRACT
} from '@/config'
function MyApp(pageProps) {

  
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={SEO_DESC} />
      </Head>
      <AppRootWrapper>
        <StakeProvider chainId={MAINNET_CHAIN_ID} contractAddress={MAINNET_CONTRACT}>
          <GGWStakeView />
        </StakeProvider>
      </AppRootWrapper>
    </>
  )
}

export default MyApp;

import { useState, useEffect } from 'react'

import Web3Connector from '@/web3/Web3Connector'
import InjectedWeb3Provider from '@/web3/InjectedWeb3Provider'

import ModalProvider from "@/contexts/ModalContext";
import NotificationProvider from "@/contexts/NotificationContext"
import MarkDownProvider from '@/contexts/MarkDownContext'
import StakeProvider from '@/contexts/StakeContext'

import NETWORKS from '@/constants/NETWORKS'
import {
  MAINNET_CHAIN_ID,
  MAINNET_CONTRACT,
} from '@/config'

const allChainIds = Object.keys(NETWORKS).map((slug) => {
  return NETWORKS[slug].chainId
})

export default function AppRoot(props) {
  const {
    children,
  } = props

  const chainId = MAINNET_CHAIN_ID

  return (
    <>
      <MarkDownProvider>
        <NotificationProvider>
          <Web3Connector chainIds={chainId} autoConnect={true}>
            <InjectedWeb3Provider chainId={chainId} chainIds={[chainId]}>
              <StakeProvider chainId={MAINNET_CHAIN_ID} contractAddress={MAINNET_CONTRACT}>
                <ModalProvider>
                  {children}
                </ModalProvider>
              </StakeProvider>
            </InjectedWeb3Provider>
          </Web3Connector>
        </NotificationProvider>
      </MarkDownProvider>
    </>
  )
}
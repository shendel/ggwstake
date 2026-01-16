
import { useEffect, useState, Component } from "react"

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import ConnectWalletButton from '@/components/ConnectWalletButton'

import LoadingPlaceholder from '@/components/LoadingPlaceholder'
import StakingDashboard from '@/components/stake/StakingDashboard'

export default function Home(props) {
  const {
    gotoPage,
    params,
    on404
  } = props

  const {
    isConnected,
    injectedAccount
  } = useInjectedWeb3()


  return (
    <>
      <StakingDashboard />
      {/*
      <div className="min-h-screen flex items-center justify-center p-4">
        Stake
      </div>
      */}
    </>
  )
}

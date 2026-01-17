
import { useEffect, useState, Component } from "react"

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import ConnectWalletButton from '@/components/ConnectWalletButton'

import LoadingPlaceholder from '@/components/LoadingPlaceholder'
import GGWStakeAdmin from '@/components/stake/admin/'
import { useStakeContext } from '@/contexts/StakeContext'

export default function Admin(props) {
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
      <GGWStakeAdmin />
      {/*
      <div className="min-h-screen flex items-center justify-center p-4">
        Stake
      </div>
      */}
    </>
  )
}

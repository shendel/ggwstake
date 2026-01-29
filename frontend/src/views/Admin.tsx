
import { useEffect, useState, Component } from "react"

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import ConnectWalletButton from '@/components/ConnectWalletButton'

import LoadingPlaceholder from '@/components/LoadingPlaceholder'
import OnlyOwner from '@/components/stake/admin/OnlyOwner'

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
    <OnlyOwner>
      <GGWStakeAdmin {...props } />
    </OnlyOwner>
  )
}


import { useEffect, useState, Component } from "react"

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import ConnectWalletButton from '@/components/ConnectWalletButton'
import AdminDepositsPage from '@/components/stake/admin/AdminDepositsPage'
import LoadingPlaceholder from '@/components/LoadingPlaceholder'
import { useStakeContext } from '@/contexts/StakeContext'
import OnlyOwner from '@/components/stake/admin/OnlyOwner'

export default function AdminDeposits(props) {
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
      <AdminDepositsPage {...props} />
    </OnlyOwner>
  )
}

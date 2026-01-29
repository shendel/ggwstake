import AccessDeniedSplash from '@/components/appconfig/AccessDeniedSplash'
import { useStakeContext } from '@/contexts/StakeContext';
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

const OnlyOwner = (props) => {
  const { children } = props
  const {
    summaryInfo: {
      owner
    },
    isSummaryLoaded
  } = useStakeContext()
  const { injectedAccount } = useInjectedWeb3()
  
  if (!isSummaryLoaded) return null
  if (!injectedAccount) return (
    <>Connect wallet</>
  )
  if (owner.toLowerCase() != injectedAccount.toLowerCase()) {
    return <AccessDeniedSplash adminAddress={owner} />
  }
  return (
    <>{children}</>
  )
}

export default OnlyOwner
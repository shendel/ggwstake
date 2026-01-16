
import { GET_CHAIN_BYID } from '@/web3/chains'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import {
  MAINNET_CHAIN_ID
} from '@/config'

const SwitchChainButton = () => {
  const {
    switchNetwork,
    isSwitchingNetwork,
  } = useInjectedWeb3()
  const handleSwitch = () => {
    switchNetwork(MAINNET_CHAIN_ID)
  }
  
  const chainInfo = GET_CHAIN_BYID(MAINNET_CHAIN_ID)
  console.log('>>> chainInfo', chainInfo)
  console.log('>>> is switchin', isSwitchingNetwork)
  return (
    <button
      onClick={handleSwitch}
      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2"
    >
      <>{`Switch to "${chainInfo.name}"`}</>
    </button>
  )
}


export default SwitchChainButton
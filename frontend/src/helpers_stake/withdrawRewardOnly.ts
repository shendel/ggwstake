import ContractJson from "@/abi/GGWStake.json"
import callContractMethod from '@/helpers/callContractMethod'

const withdrawRewardOnly = (options) => {
  const {
    activeWeb3,
    address,
    depositId,
    calcGas,
    onTrx = (txHash) => {},
    onSuccess = () => {},
    onError = () => {},
    onFinally = () => {}
  } = options
  
  const contract = new activeWeb3.eth.Contract(ContractJson.abi, address)
  
  return callContractMethod({
    activeWeb3,
    contract,
    method: 'withdrawRewardsOnly',
    args: [
      depositId
    ],
    calcGas,
    onTrx,
    onSuccess,
    onError,
    onFinally
  })
}


export default withdrawRewardOnly
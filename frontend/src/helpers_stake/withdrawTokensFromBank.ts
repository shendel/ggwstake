import ContractJson from "@/abi/GGWStake.json"
import callContractMethod from '@/helpers/callContractMethod'

const withdrawTokensFromBank = (options) => {
  const {
    activeWeb3,
    address,
    amount,
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
    method: 'withdrawBank',
    args: [
      amount
    ],
    calcGas,
    onTrx,
    onSuccess,
    onError,
    onFinally
  })
}


export default withdrawTokensFromBank
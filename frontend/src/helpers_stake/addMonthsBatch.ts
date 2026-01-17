import ContractJson from "@/abi/GGWStake.json"
import callContractMethod from '@/helpers/callContractMethod'

const addMonthsBatch = (options) => {
  const {
    activeWeb3,
    address,
    monthsStart,
    monthsEnd,
    monthsRates,
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
    method: 'addMonthsBatch',
    args: [
      monthsStart,
      monthsEnd,
      monthsRates,
    ],
    calcGas,
    onTrx,
    onSuccess,
    onError,
    onFinally
  })
}


export default addMonthsBatch
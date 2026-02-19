const ContractData = require("./abi/GGWStakePoolAcumulate.json")
const { BigNumber } = require('bignumber.js')

const fetchSummary = async (options) => {
  const {
    activeWeb3,
    contractAddress
  } = options
  const contract = new activeWeb3.eth.Contract(ContractData.abi, contractAddress)
  const summary = await contract.methods.getSummaryInfo().call()

  return summary
}
module.exports = { fetchSummary }
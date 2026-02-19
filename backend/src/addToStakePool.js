const ContractData = require("./abi/GGWStakePoolAcumulate.json")
const { BigNumber } = require('bignumber.js')
const { calcSendArgWithFee } = require('./calcSendArgWithFee')


const addToStakePool = (params) => {
  const {
    activeWeb3,
    contractAddress,
    activeWallet,
  } = params
  return new Promise(async (resolve, reject) => {
    try {
      const contract = new activeWeb3.eth.Contract(ContractData.abi, contractAddress)
      
      const methodArgs = []
      const sendArgs = await calcSendArgWithFee(
        activeWallet,
        contract,
        'toStakePool',
        methodArgs,
        0
      )
      const gasPrice = await activeWeb3.eth.getGasPrice()
      sendArgs.gasPrice = process.env.GAS_PRICE  // gasPrice

      let txHash
      contract.methods.toStakePool(...methodArgs)
        .send(sendArgs)
        .on('transactionHash', (hash) => {
          console.log(`>>>> Add to Stake pool txHash`, hash)
          txHash = hash
        })
        .on('error', (error) => {
          console.log('transaction error:', error)
          reject(error)
        })
        .on('receipt', (receipt) => {
        })
        .then((res) => {
          resolve(txHash)
        }).catch((err) => {
          console.log('>>> Fail addToStakePool', err)
          reject(err)
        })
    } catch (err) {
      console.log(err.message)
      reject(err)
    }
  })
}


module.exports = { addToStakePool }
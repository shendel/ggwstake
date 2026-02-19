const WEB3 = require('web3')
const { getEthLikeWallet } = require('./getEthLikeWallet')

const initWeb3 = () => {
  const rpc_ws = process.env.RPC_WS
  const rpc = process.env.RPC
  console.log('>>> Initing Web3 on Http', rpc)
  console.log('>>> Initing Web3 on WS', rpc_ws)
  
  const web3 = new WEB3(new WEB3.providers.HttpProvider(rpc))
  const web3_ws = new WEB3(new WEB3.providers.WebsocketProvider(rpc_ws))
  const wallet = getEthLikeWallet({ mnemonic: process.env.SEED })
  
  console.log('>>> Account: ', wallet.address)

  const account = web3.eth.accounts.privateKeyToAccount( wallet.privateKey )
  web3.eth.accounts.wallet.add( account.privateKey )
  
  const account_ws = web3_ws.eth.accounts.privateKeyToAccount( wallet.privateKey )
  web3_ws.eth.accounts.wallet.add( account_ws.privateKey )
  
  console.log('>>> Web3 inited')
  return {
    http: web3,
    ws: web3_ws
  }
}
const getActiveWallet = () => {
  const wallet = getEthLikeWallet({ mnemonic: process.env.SEED })
  
  console.log('>>> Account: ', wallet.address)
  return wallet.address
}

module.exports = { initWeb3, getActiveWallet }
import ContractJson from "@/abi/GGWStake.json"
import TokenAbi from 'human-standard-token-abi'
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { GET_CHAIN_RPC } from '@/web3/chains'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface }from '@/web3/getMultiCall'

import { callMulticall } from '@/helpers/callMulticall'
import Web3ObjectToArray from "@/helpers/Web3ObjectToArray"
import { fromWei } from '@/helpers/wei'

const fetchUserSummary = (options) => {
  const {
    contractAddress,
    chainId,
    userAddress,
    tokenAddress,
    depositsLimit = 10,
  } = {
    ...options
  }

  return new Promise((resolve, reject) => {
    const ContractAbi = ContractJson.abi

    const multicall = getMultiCall(chainId)
    const abiI = new AbiInterface(ContractAbi)
    
    const tokenAbiI = new AbiInterface(TokenAbi)

    callMulticall({
      multicall,
      target: contractAddress,
      encoder: abiI,
      calls: {
        depositsCount: { func: 'getUserDepositsCount', args: [ userAddress ] },
        tokenBalance: { func: 'balanceOf', args: [ userAddress ], target: tokenAddress, encoder: tokenAbiI },
        tokenAllowance: { func: 'allowance', args: [ contractAddress, userAddress ], target: tokenAddress, encoder: tokenAbiI }
      }
    }).then((mcAnswer) => {
      
      resolve({
        chainId,
        contractAddress,
        ...mcAnswer,
      })

    }).catch((err) => {
      console.log('>>> Fail fetch user summary', err)
      reject(err)
    })
  })
}

export default fetchUserSummary
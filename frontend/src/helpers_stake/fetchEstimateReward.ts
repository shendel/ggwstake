import ContractJson from "@/abi/GGWStake.json"
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { GET_CHAIN_RPC } from '@/web3/chains'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface }from '@/web3/getMultiCall'

import { callMulticall } from '@/helpers/callMulticall'
import Web3ObjectToArray from "@/helpers/Web3ObjectToArray"
import { fromWei } from '@/helpers/wei'

const fetchEstimateReward = (options) => {
  const {
    address,
    chainId,
    amount,
    lockPeriod,
  } = {
    ...options
  }
  console.log('>>> fetchEstimateReward', options)

  return new Promise((resolve, reject) => {
    const ContractAbi = ContractJson.abi

    const multicall = getMultiCall(chainId)
    const abiI = new AbiInterface(ContractAbi)

    callMulticall({
      multicall,
      target: address,
      encoder: abiI,
      calls: {
        amount: { func: 'calculateRewardByMonths', args: [ amount, lockPeriod, 0 ] },

      }
    }).then((answer) => {
      const {
        amount,
      } = answer
      console.log('>>> fetchEstimateReward', answer)
      resolve({
        chainId,
        address,
        amount,
      })
    }).catch((err) => {
      console.log('>>> Fail fetch all info', err)
      reject(err)
    })
  })
}

export default fetchEstimateReward
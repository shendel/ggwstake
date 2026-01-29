import ContractJson from "@/abi/GGWStake.json"
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { GET_CHAIN_RPC } from '@/web3/chains'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface }from '@/web3/getMultiCall'

import { callMulticall } from '@/helpers/callMulticall'
import delay from '@/helpers/delay'


const fetchDeposits = (options) => {
  const {
    address,
    chainId,
    offset = 0,
    limit = 10,
    batchSize = 50,
    batchDelay = 100,
    onBatch = (batch, offset, total) => {},
    onReady = () => {}
  } = {
    ...options
  }

  return new Promise(async (resolve, reject) => {
    const ContractAbi = ContractJson.abi

    const multicall = getMultiCall(chainId)
    const abiI = new AbiInterface(ContractAbi)

    let currentOffset = offset
    let result = []
    const _doFetchBatch = () => {
      return new Promise((batchResolved, batchReject) => {
        callMulticall({
          multicall,
          target: address,
          encoder: abiI,
          calls: {
            batch: { func: 'getDeposits', args: [ currentOffset, (limit < batchSize) ? limit : batchSize ], asArray: true },
          }
        }).then((answer) => {
          const {
            batch
          } = answer
          console.log('>> active deposits batch', batch)
          batchResolved(batch)
        }).catch((err) => {
          console.log('>>> Fail fetch active deposits', err)
          batchReject(err)
        })
      })
    }

    try {
      do {
        const batch = await _doFetchBatch()
        onBatch(batch, currentOffset, limit)
        result = [...result, ...batch]
        currentOffset+=batchSize
        await delay(batchDelay)
      } while (currentOffset <= limit)
    } catch (err) {
      reject(err)
    }
    onReady(result)
    resolve(result)
  })
}

export default fetchDeposits
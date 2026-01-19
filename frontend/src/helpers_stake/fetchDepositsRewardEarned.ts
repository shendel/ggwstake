import ContractJson from "@/abi/GGWStake.json"
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { GET_CHAIN_RPC } from '@/web3/chains'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface } from '@/web3/getMultiCall'
import { callMulticall } from '@/helpers/callMulticall'
import delay from '@/helpers/delay'

interface DepositRewardEarned {
  depositId: string;
  earned: string; // в wei
}

interface FetchDepositsRewardEarnedOptions {
  address: string;
  chainId: number;
  depositsIds: (string | number | bigint)[];
  batchSize?: number;
  batchDelay?: number;
  onBatch?: (batch: DepositRewardEarned[], offset: number, total: number) => void;
  onReady?: (result: DepositRewardEarned[]) => void;
}

const fetchDepositsRewardEarned = (options: FetchDepositsRewardEarnedOptions): Promise<DepositRewardEarned[]> => {
  const {
    address,
    chainId,
    depositsIds = [],
    batchSize = 50,
    batchDelay = 100,
    onBatch = (batch, offset, total) => {},
    onReady = () => {}
  } = options;

  return new Promise(async (resolve, reject) => {
    const ContractAbi = ContractJson.abi;
    const multicall = getMultiCall(chainId);
    const abiI = new AbiInterface(ContractAbi);

    let result: DepositRewardEarned[] = [];
    
    try {
      // Разбиваем массив IDs на батчи
      for (let i = 0; i < depositsIds.length; i += batchSize) {
        const batchIds = depositsIds.slice(i, i + batchSize);
        
        // Вызов функции контракта для текущего батча
        const response = await callMulticall({
          multicall,
          target: address,
          encoder: abiI,
          calls: {
            batch: { func: 'getDepositsRewardEarned', args: [batchIds], asArray: true },
          }
        });

        const batch: DepositRewardEarned[] = response.batch.map(item => ({
          depositId: item.depositId,
          earned: item.earned
        }));

        onBatch(batch, i, depositsIds.length);
        result = [...result, ...batch];
        
        // Задержка между батчами
        if (i + batchSize < depositsIds.length) {
          await delay(batchDelay);
        }
      }
    } catch (err) {
      reject(err);
      return;
    }

    onReady(result);
    resolve(result);
  });
}

export default fetchDepositsRewardEarned
export type { DepositRewardEarned }
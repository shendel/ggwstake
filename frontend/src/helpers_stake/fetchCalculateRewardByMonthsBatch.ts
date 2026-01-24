import ContractJson from "@/abi/GGWStake.json";
import { Interface as AbiInterface } from '@ethersproject/abi';
import getMultiCall from '@/web3/getMultiCall';
import { callMulticall } from '@/helpers/callMulticall';
import delay from '@/helpers/delay';
import BigNumber from 'bignumber.js';

// Тип для параметров вызова
interface CalculateRewardParams {
  amount: string; // wei string
  lockMonths: number;
  depositStart: string; // timestamp string
}

// Тип для результата вызова
type CalculateRewardResult = string; // wei string

interface FetchCalculateRewardByMonthsBatchOptions {
  address: string;
  chainId: number;
  paramsList: CalculateRewardParams[]; // Список параметров для каждого вызова
  batchSize?: number;
  batchDelay?: number;
  onBatch?: (results: CalculateRewardResult[], offset: number, total: number) => void;
  onReady?: (finalResults: CalculateRewardResult[]) => void;
}

const fetchCalculateRewardByMonthsBatch = (options: FetchCalculateRewardByMonthsBatchOptions): Promise<CalculateRewardResult[]> => {
  const {
    address,
    chainId,
    paramsList,
    batchSize = 50,
    batchDelay = 100,
    onBatch = () => {},
    onReady = () => {}
  } = options;

  return new Promise(async (resolve, reject) => {
    const ContractAbi = ContractJson.abi;
    const multicall = getMultiCall(chainId);
    const abiI = new AbiInterface(ContractAbi);

    let result: CalculateRewardResult[] = [];

    try {
      // Разбиваем paramsList на батчи
      for (let i = 0; i < paramsList.length; i += batchSize) {
        const batchParams = paramsList.slice(i, i + batchSize);

        // Подготавливаем вызовы для мультикалла
        const calls: Record<string, any> = {};
        batchParams.forEach((params, idx) => {
          calls[`call_${idx}`] = {
            func: 'calculateRewardByMonths',
            args: [params.amount, params.lockMonths, params.depositStart],
          };
        });

        // Выполняем мультикалл
        const response = await callMulticall({
          multicall,
          target: address,
          encoder: abiI,
          calls,
        });

        // Извлекаем результаты из ответа
        const batchResults: CalculateRewardResult[] = [];
        Object.keys(response).forEach(key => {
          if (key.startsWith('call_')) {
            batchResults.push(response[key]);
          }
        });

        onBatch(batchResults, i, paramsList.length);
        result = [...result, ...batchResults];

        // Задержка между батчами
        if (i + batchSize < paramsList.length) {
          await delay(batchDelay);
        }
      }
    } catch (err) {
      console.error(">>> Fail fetch calculateRewardByMonths batch", err);
      reject(err);
      return;
    }

    onReady(result);
    resolve(result);
  });
};

export default fetchCalculateRewardByMonthsBatch;
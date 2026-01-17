// @ts-nocheck
import { useState } from 'react';
import { fromWei } from '@/helpers/wei';
import BigNumber from 'bignumber.js';

interface DepositCardProps {
  deposit: {
    depositId: string;
    owner: string;
    amount: string; // в wei
    monthIndex: string;
    depositStart: string; // timestamp
    depositClosed: string; // timestamp
    unlockMonthIndex: string;
    lastAccruedMonthIdx: string;
    pendingReward: string; // в wei
    active: boolean;
    isSaved: boolean;
    savedReward: string; // в wei
    ownRate: boolean;
    rate: string; // в bps
  };
  tokenSymbol: string;
  tokenDecimals: number;
  currentMonth: string;
  globalRateBps: string;
}

export default function DepositCard({ deposit, tokenSymbol, tokenDecimals, currentMonth, globalRateBps }: DepositCardProps) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  
  // Конвертируем wei в удобный формат
  const formatAmount = (weiAmount: string) => {
    if (!weiAmount) return '0.00';
    return new BigNumber(fromWei(weiAmount, tokenDecimals)).toFixed(4).replace(/\.0*$|(?<=\.\d*)0*$/, "");
  };

  // Определяем, заблокирован ли депозит
  const isLocked = Number(deposit.unlockMonthIndex) > Number(currentMonth);
  
  // Определяем тип ставки
  const effectiveRate = deposit.ownRate ? '0' : deposit.rate || globalRateBps;
  
  // Вычисляем дату разблокировки (примерно)
  const unlockDate = new Date(Number(deposit.depositStart) * 1000 + Number(deposit.unlockMonthIndex) * 30 * 24 * 60 * 60 * 1000);
  const unlockDateString = unlockDate.toLocaleDateString();

  return (
    <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white">{formatAmount(deposit.amount)} {tokenSymbol}</h3>
            <p className="text-sm text-gray-300 mt-1">
              Locked until month #{deposit.unlockMonthIndex}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isLocked ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {isLocked ? 'Locked' : 'Unlocked'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Unlock Month</span>
            <p className="font-medium">#{deposit.unlockMonthIndex}</p>
          </div>
          <div>
            <span className="text-gray-500">Pending Reward</span>
            <p className="font-medium text-green-600">+{formatAmount(deposit.pendingReward)} {tokenSymbol}</p>
          </div>
          <div>
            <span className="text-gray-500">Start Month</span>
            <p className="font-medium">#{deposit.monthIndex}</p>
          </div>
          <div>
            <span className="text-gray-500">Rate</span>
            <p className="font-medium">{effectiveRate} bps</p>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={isLocked}
            className="flex-1 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>
          <button className="flex-1 py-1.5 text-sm bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 rounded">
            Details
          </button>
        </div>
      </div>

      {showWithdraw && (
        <div className="border-t p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Withdraw Options</h4>
          <div className="space-y-2">
            <button className="w-full text-left py-1.5 px-3 bg-white border rounded hover:bg-gray-50 text-sm">
              Rewards only ({formatAmount(deposit.pendingReward)} {tokenSymbol})
            </button>
            <button 
              disabled={isLocked}
              className="w-full text-left py-1.5 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm"
            >
              Principal + Rewards ({new BigNumber(formatAmount(deposit.amount)).plus(formatAmount(deposit.pendingReward)).toFixed(4)} {tokenSymbol})
            </button>
          </div>
          <button 
            onClick={() => setShowWithdraw(false)}
            className="mt-2 w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
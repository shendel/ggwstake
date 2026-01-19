import React from 'react';
import { useStakeContext } from '@/contexts/StakeContext'
import DotsLoader from '@/components/DotsLoader'
import LoadingIndicator from '@/components/LoadingIndicator'
import {
  formatAmount,
  formatMonth,
  formatDate
} from '@/helpers_stake/'

interface SummaryDepositInfoProps {
  amount: string;
  lockMonths: string;
  estimatedReward: string;
  firstEstimatedReward: string;
  tokenSymbol: string;
  currentMonth: string;
  minLockMonths: string;
  onApprove: () => void;
  onCreate: () => void;
  onCancel: () => void;
  isApproving: boolean;
  isNeedApprove: boolean;
  isCreating: boolean;
}

const SummaryDepositInfo: React.FC<SummaryDepositInfoProps> = ({
  amount,
  lockMonths,
  estimatedReward,
  firstEstimatedReward,
  tokenSymbol,
  currentMonth,
  minLockMonths,
  onApprove,
  onCreate,
  onCancel,
  isApproving,
  isNeedApprove,
  isCreating
}) => {
  const {
    depositMonths,
  } = useStakeContext()

  const firstRewardMonth = (parseInt(currentMonth) + 1).toString();
  const unlockMonth = (parseInt(currentMonth) + parseInt(lockMonths)).toString();

  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Deposit Summary</h3>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Amount</span>
          <span className="font-medium">{amount} {tokenSymbol}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Lock Period</span>
          <span className="font-medium">{lockMonths} months</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Estimated Reward At Unlock~</span>
          <span className="font-medium text-green-500">+{estimatedReward} {tokenSymbol}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">First Reward Month</span>
          <span className="font-medium">
            {(depositMonths[firstRewardMonth]) ? (
              <>{formatMonth(depositMonths[firstRewardMonth].start)}</>
            ) : (
              <span className="animate-pulse">{`#${firstRewardMonth}`}</span>
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">First Estimated Reward ~</span>
          <span className="font-medium text-green-500">+{firstEstimatedReward} {tokenSymbol}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Unlock Month</span>
          <span className="font-medium">
            {(depositMonths[unlockMonth]) ? (
              <>{formatMonth(depositMonths[unlockMonth].start)}</>
            ) : (
              <span className="animate-pulse">{`#${unlockMonth}`}</span>
            )}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-xs text-blue-800">
          Your deposit will generate rewards according to the current rate.
          You can withdraw your principal and earned rewards after the lock period ends.
        </p>
      </div>

      <div className="space-y-2">
        {isNeedApprove ? (
          <button
            onClick={onApprove}
            disabled={isApproving || isCreating} // Отключаем при создании
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? 'Approving...' : `Approve ${tokenSymbol} for Deposit`}
          </button>
        ) : (
          <button
            onClick={onCreate}
            disabled={isCreating || isApproving} // Отключаем при апруве
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Deposit'}
          </button>
        )}

        <button
          onClick={onCancel}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition"
        >
          Back to Form
        </button>
      </div>
    </div>
  );
};

export default SummaryDepositInfo;
import React, { useState, useEffect } from 'react';
import { getTransactionLink, getShortTxHash, getShortAddress, getAddressLink } from '@/helpers/etherscan'
import BigNumber from "bignumber.js"
import { fromWei, toWei } from '@/helpers/wei'
import { useStakeContext } from '@/contexts/StakeContext'
import { formatMonth } from '@/helpers_stake/'

interface AdminStat {
  title: string;
  value: string | number;
  subValue?: string;
}

interface AdminStatsProps {
  stats: Record<string, any>; // данные с контракта
}

const AdminStats: React.FC<AdminGameStatsProps> = (props) => {
  const {
    onClick
  } = props
  const {
    summaryInfo: {
      owner,
      oracle,
      stakeOracle,
      activeDepositsCount,
      estimateRequiredBankReservePrecise,
      bankAmount,
      currentMonth,
      minLockAmount,
      minLockMonths,
      depositsCount,
      depositsAmount,
      rewardsPayed
    },
    depositMonths,
    isDepositMonthsFetching,
    isSummaryLoaded,
    tokenInfo,
    activeDepositsPendingReward,
    estimatedMonthlyRewardsSum,
    updateActiveDeposits
  } = useStakeContext()
  useEffect(() => {
    if (isSummaryLoaded) {
      updateActiveDeposits()
    }
  }, [ isSummaryLoaded ])
  
  const formatTokenAmount = (amount) => {
    if (!isSummaryLoaded) return '...'
    return fromWei(amount, tokenInfo.decimals) + ` ` + tokenInfo.symbol
  };


  const statItems: GameStat[] = [
    {
      title: 'Current month',
      value: (depositMonths[currentMonth]) ? formatMonth(depositMonths[currentMonth].start) : `#${currentMonth}`,
      key: 'currentMonth',
      clickable: true
    },
    {
      title: 'Token',
      value: tokenInfo?.symbol || '—',
      subValue: tokenInfo?.name,
    },
    {
      title: 'Deposits (Active/Total)',
      value: `${activeDepositsCount} / ${depositsCount}`,
      key: 'deposits',
      clickable: true
    },
    {
      title: 'Deposited (Locked) amount',
      value: formatTokenAmount(depositsAmount),
      key: 'activeDeposits',
      clickable: true
    },
    {
      title: 'Pending reward',
      value: formatTokenAmount(activeDepositsPendingReward),
      key: 'pendingReward',
      clickable: true
    },
    {
      title: 'Estimated at month end',
      value: formatTokenAmount(estimatedMonthlyRewardsSum),
      key: 'estimatedMonthlyRewardsSum',
      clickable: true
    },
    {
      title: 'Estimated reward',
      value: formatTokenAmount(estimateRequiredBankReservePrecise),
      key: 'estimateRequiredBankReservePrecise',
      clickable: true
    },
    {
      title: 'Bank amount',
      value: formatTokenAmount(bankAmount),
      key: 'bankAmount',
      clickable: true
    },
    {
      title: 'Owner',
      value: owner ? getShortAddress(owner, 6) : '—',
      key: 'owner',
      clickable: true,
    },
    {
      title: 'Lock Oracle',
      value: oracle ? getShortAddress(oracle, 6) : '—',
      key: 'oracle',
      clickable: true,
    },
    {
      title: 'Add Pool Oracle',
      value: stakeOracle ? getShortAddress(stakeOracle, 6) : '—',
      key: 'stakeOracle',
      clickable: true,
    },
    {
      title: 'Min Lock Amount',
      value: minLockAmount ? formatTokenAmount(minLockAmount) : '—',
      key: 'minLockAmount',
      clickable: true,
    },
    {
      title: 'Min Lock Months',
      value: minLockMonths || '-',
      key: 'minLockMonths',
      clickable: true,
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {statItems.map((item, index) => {
          return (
            <div
              key={index}
              className={`
                bg-gray-800 p-2 rounded-lg shadow border border-gray-700 hover:border-indigo-500 transition 
                ${item.clickable ? 'cursor-pointer' : ''}
              `}
              onClick={() => {
                if (item.clickable && item.key) {
                  onClick(item.key)
                }
              }}
            >
              <dt className="text-sm font-medium text-gray-400">{item.title}</dt>
              <dd className="mt-1 text-lg font-bold text-white">{item.value}</dd>
              {item.value2 && (
                <dd className="mt-1 text-lg font-bold text-white">{item.value2}</dd>
              )}
              {item.subValue && (
                <dd className="mt-1 text-xs text-gray-500">{item.subValue}</dd>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default AdminStats;
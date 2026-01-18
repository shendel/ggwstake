import { toWei, fromWei } from '@/helpers/'
import { useStakeContext } from '@/contexts/StakeContext'
import BigNumber from "bignumber.js"
import { formatAmount, formatMonth } from '@/helpers_stake'


export default function RewardsChart(props) {
  const { rewardsByMonth , months } = props
  
  const {
    summaryInfo,
    summaryInfo: {
      activeDepositsCount,
      depositsAmount,
      usersCount,
      rewardsPayed,
      currentMonth,
    },
    depositMonths,
    tokenInfo,
    isSummaryLoaded,
  } = useStakeContext()
  
  if (months.length === 0) return null;

  //const maxReward = Math.max(...rewardsByMonth.map(m => parseFloat(m.reward)));
  const maxReward = BigNumber.max(
    ...months.map(m => new BigNumber(m.rewardsAmount))
  );
  const barWidth = 100 / months.length;

  return (
    <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Payed rewards by Month ({tokenInfo.symbol})</h2>
      <div className="space-y-2">
        {months.map((monthData, idx) => {
          const height = maxReward.gt(0) 
          ? new BigNumber(monthData.rewardsAmount).div(maxReward).multipliedBy(100).toNumber() 
          : 0;
          return (
            <div key={idx} className="flex items-end h-12">
              <div className="w-12 text-right text-sm text-gray-500 pr-2">
                {formatMonth(monthData.start)}
              </div>
              <div className="flex-1 flex items-end h-full bg-gray-100 rounded">
                <div 
                  className="bg-indigo-500 rounded transition-all duration-500"
                  style={{ 
                    height: `${height}%`,
                    width: `${barWidth}%`,
                    marginLeft: `${barWidth * (months.length - idx - 1)}%`
                  }}
                ></div>
              </div>
              <div className="w-16 text-left text-sm font-medium ml-2 overflow-hidden">
                {formatAmount(monthData.rewardsAmount, tokenInfo.decimals)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
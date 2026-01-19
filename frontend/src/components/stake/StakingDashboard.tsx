// @ts-nocheck
import { useState, useEffect } from 'react';
import StakingInfo from './StakingInfo';
import CreateDeposit from './CreateDeposit';
import DepositCard from './DepositCard';
import StatCard from './StatCard';
import RewardsChart from './RewardsChart';
import UserDeposits from './UserDeposits'
import DotsLoader from '@/components/DotsLoader'
import { AnimatePresence } from 'framer-motion'
import { formatAmount } from '@/helpers_stake/'
import { getPastMonths } from '@/helpers_stake/'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useStakeContext } from '@/contexts/StakeContext'

export default function StakingDashboard() {
  const {
    injectedAccount
  } = useInjectedWeb3()
  
  const [account, setAccount] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalAmount: '0',
    totalUsers: 0,
    rewardsByMonth: [] // [{month: 0, reward: '1.2'}, ...]
  });
  const [loading, setLoading] = useState(true);

  const stakeContext = useStakeContext()
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
  
  console.log('>> stakeContext', stakeContext)
  useEffect(() => {
    // Имитация загрузки данных из контракта
    setTimeout(() => {
      setAccount('0x...1234');
      setDeposits([
        { id: 0, amount: '100', lockMonths: 3, unlockDate: '2026-04-15', reward: '1.26' },
        { id: 1, amount: '50', lockMonths: 6, unlockDate: '2026-07-15', reward: '3.15' }
      ]);
      
      // Статистика из контракта:
      setStats({
        totalDeposits: 42,
        totalAmount: '1250.50',
        totalUsers: 28,
        rewardsByMonth: [
          { month: 0, reward: '12.5' },
          { month: 1, reward: '18.3' },
          { month: 2, reward: '22.1' },
          { month: 3, reward: '19.8' },
          { month: 4, reward: '15.2' }
        ]
      });
      setLoading(false);
    }, 800);
  }, []);

  const [ monthsForChart, setMonthsForChart ] = useState([])
  
  useEffect(() => {
    if (isSummaryLoaded) {
      const _months = getPastMonths( currentMonth, depositMonths, 6)
      console.log('>> months for chart', _months)
      setMonthsForChart(
        _months
      )
    }
  }, [ depositMonths ])
  //if (!isSummaryLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Deposits"
            value={(isSummaryLoaded
              ? activeDepositsCount
              : <DotsLoader />
            )}
            icon="🏦"
          />
          <StatCard 
            title="Total Locked" 
            value={(isSummaryLoaded
              ? `${formatAmount(depositsAmount, tokenInfo.decimals)} ${tokenInfo.symbol}`
              : <DotsLoader color="green" />
            )}
            icon="🔒" 
            isCurrency 
          />
          <StatCard
            title="Unique Users"
            value={(isSummaryLoaded
              ? usersCount
              : <DotsLoader />
            )}
            icon="👥"
          />
          <StatCard 
            title="Total Rewards Paid" 
            value={(isSummaryLoaded
              ? `${formatAmount(rewardsPayed, tokenInfo.decimals)} ${tokenInfo.symbol}`
              : <DotsLoader color="green" />
            )}
            icon="💰" 
            isCurrency 
          />
        </div>

        {/* График и основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StakingInfo />
            <CreateDeposit />
            <RewardsChart months={monthsForChart} rewardsByMonth={stats.rewardsByMonth} />
          </div>
          {injectedAccount ? (
            <UserDeposits />
          ) : (
            <div>Not connected</div>
          )}
        </div>
      </div>
    </div>
  );
}
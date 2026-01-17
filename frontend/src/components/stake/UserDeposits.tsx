import { useState, useEffect } from 'react'
import { useStakeContext } from '@/contexts/StakeContext'
import { useModal } from '@/contexts/ModalContext'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useNotification } from '@/contexts/NotificationContext'
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import DepositCard from './DepositCard'
import DepositTabs from './DepositTabs'


const UserDeposits = (props) => {
  const {
    userDeposits,
    summaryInfo,
    summaryInfo: {
      currentMonth
    },
    isUserDepositsFetching,
    isUserDepositsFetchingError,
    isUserDepositsLoaded,
  } = useStakeContext()

  const [ deposits, setDeposits ] = useState([])

  useEffect(() => {
    setDeposits(userDeposits)
  }, [ userDeposits ])

  const [activeTab, setActiveTab] = useState('all');

  const filteredDeposits = userDeposits.filter(deposit => {
    switch(activeTab) {
      case 'all':
        return true;
      case 'unlocked':
        return Number(deposit.unlockMonthIndex) <= Number(currentMonth);
      case 'withReward':
        return new BigNumber(deposit.pendingReward).isGreaterThan(0);
      case 'locked':
        return Number(deposit.unlockMonthIndex) > Number(currentMonth);
      case 'closed':
        return deposit.depositClosed !== '0';
      default:
        return true;
    }
  });

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Your Deposits</h2>
      <DepositTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      {filteredDeposits.length === 0 ? (
        <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-gray-500">No deposits</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeposits.map(deposit => (
            <DepositCard
              key={deposit.depositId}
              deposit={deposit}
              tokenSymbol={summaryInfo.tokenSymbol}
              tokenDecimals={summaryInfo.tokenDecimals}
              currentMonth={summaryInfo.currentMonth}
              globalRateBps={summaryInfo.globalRateBps}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default UserDeposits
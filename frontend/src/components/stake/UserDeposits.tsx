import { useState, useEffect, useRef } from 'react'
import { useStakeContext } from '@/contexts/StakeContext'
import { useModal } from '@/contexts/ModalContext'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useNotification } from '@/contexts/NotificationContext'
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import DepositCard from './DepositCard'
import DepositTabs from './DepositTabs'
import UserDepositsPagination from './UserDepositsPagination'


const UserDeposits = (props) => {
  const {
    userDeposits,
    depositMonths,
    summaryInfo,
    summaryInfo: {
      currentMonth,
      bankAmount
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
        return (new BigNumber(deposit.pendingReward).isGreaterThan(0)) || (deposit.isSaved);
      case 'locked':
        return Number(deposit.unlockMonthIndex) > Number(currentMonth);
      case 'closed':
        return deposit.depositClosed !== '0';
      default:
        return true;
    }
  }).sort((a,b) => {
    switch (activeTab) {
      case 'closed':
        return (Number(a.depositClosed) > Number(b.depositClosed)) ? -1 : 1
      case 'withReward':
        if (!a.active && !b.active) {
          return (Number(a.depositClosed) > Number(b.depositClosed)) ? -1 : 1
        } else {
          if (a.active) return 1
          if (b.active) return -1
        }
      default:
        return (Number(a.depositStart) > Number(b.depositStart)) ? -1 : 1
    }
  })

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const listContainerRef = useRef(null);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDeposits = filteredDeposits.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1)
  }, [ activeTab ])

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Your Deposits</h2>
      <div ref={listContainerRef} className="smooth-scroll">
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
            {paginatedDeposits.map(deposit => (
              <DepositCard
                key={deposit.depositId}
                deposit={deposit}
                months={depositMonths}
                tokenSymbol={summaryInfo.tokenSymbol}
                tokenDecimals={summaryInfo.tokenDecimals}
                currentMonth={summaryInfo.currentMonth}
                globalRateBps={summaryInfo.globalRateBps}
                bankAmount={summaryInfo.bankAmount}
                setActiveTab={setActiveTab}
              />
            ))}
          </div>
        )}
      </div>
      <UserDepositsPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        containerRef={listContainerRef}
      />
    </div>
  )
}

export default UserDeposits
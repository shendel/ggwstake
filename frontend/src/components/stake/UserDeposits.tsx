import { useState, useEffect } from 'react'
import { useStakeContext } from '@/contexts/StakeContext'
import { useModal } from '@/contexts/ModalContext'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useNotification } from '@/contexts/NotificationContext'
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import { fromWei, toWei } from '@/helpers/wei'

import DepositCard from './DepositCard'


const UserDeposits = (props) => {
  const {
    userDeposits,
    summaryInfo,
    isUserDepositsFetching,
    isUserDepositsFetchingError,
    isUserDepositsLoaded,
  } = useStakeContext()

  const [ deposits, setDeposits ] = useState([])

  useEffect(() => {
    setDeposits(userDeposits)
  }, [ userDeposits ])

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Your Deposits</h2>
      {deposits.length === 0 ? (
        <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-gray-500">No active deposits</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deposits.map(deposit => (
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
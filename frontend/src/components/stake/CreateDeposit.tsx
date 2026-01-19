import { useState, useEffect } from 'react';
import { useStakeContext } from '@/contexts/StakeContext'
import { useModal } from '@/contexts/ModalContext'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useNotification } from '@/contexts/NotificationContext'
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import { fromWei, toWei } from '@/helpers/wei'
import SwitchChainButton from '@/components/ui/SwitchChainButton'
import BigNumber from "bignumber.js"
import fetchEstimateReward from '@/helpers_stake/fetchEstimateReward'
import approveToken from '@/helpers/approveToken'
import createDeposit from '@/helpers_stake/createDeposit'
import DepositSuccess from './DepositSuccess'
import CircleInlineLoader from '@/components/CircleInlineLoader'
import { motion } from 'framer-motion';


export default function CreateDeposit({ account }) {
  const {
    chainId,
    contractAddress,
    depositMonths,
    isDepositMonthsFetching,
    summaryInfo,
    summaryInfo: {
      currentMonth,
      monthsCount,
      minLockMonths,
      minLockAmount,
    },
    tokenInfo,
    userSummaryInfo,
    isUserSummaryInfoLoaded,
    updateUserState,
    updateState,
  } = useStakeContext()

  const {
    injectedChainId,
    injectedWeb3,
    injectedAccount,
  } = useInjectedWeb3()
  
  const { addNotification } = useNotification()
  const { openModal } = useModal()


  const [amount, setAmount] = useState(``);
  const [lockMonths, setLockMonths] = useState('3');
  const [estimatedReward, setEstimatedReward] = useState('0.00');


  const setFixedAmount = (amount) => {
    amount = parseFloat(amount)
    if (!amount || parseFloat(amount) <= 0) {
      amount = 0
    } else {
      if (isUserSummaryInfoLoaded && tokenInfo) {
        if (new BigNumber(toWei(amount, tokenInfo.decimals)).isGreaterThan(userSummaryInfo.tokenBalance)) {
          amount = fromWei(userSummaryInfo.tokenBalance, tokenInfo.decimals)
        }
      }
    }
    setAmount(amount)
  }
  
  const [ isFetchEstimateReward, setIsFetchEstimateReward ] = useState(false)

  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount != ``) {
        setIsFetchEstimateReward(true)
        fetchEstimateReward({
          chainId,
          address: contractAddress,
          amount: '0x' + new BigNumber(toWei(amount, tokenInfo.decimals)).toString(16),
          lockPeriod: lockMonths
        }).then(({ amount }) => {
          setIsFetchEstimateReward(false)
          setEstimatedReward(formatAmount(amount))
        }).catch((err) => {
          setIsFetchEstimateReward(false)
          console.log('fail fetch estimatedReward', err)
        })
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [ amount, lockMonths ])

  const handleSetMaxAmount = () => {
    if (!tokenInfo) return
    setAmount(fromWei(userSummaryInfo.tokenBalance, tokenInfo.decimals))
  }
  const tokenSymbol = () => {
    return (tokenInfo && tokenInfo.symbol) ? tokenInfo.symbol : '...'
  }
  const formatAmount = (weiAmount) => {
    if (tokenInfo && weiAmount !== undefined) {
      return new BigNumber(fromWei(weiAmount, tokenInfo.decimals)).toFixed(4).replace(/\.0*$|(?<=\.\d*)0*$/, "")
    }
    return `...`
  }
  
  const [ isCreateDeposit, setIsCreateDeposit ] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleCreateDeposit = () => {
    setIsCreateDeposit(true)
    addNotification('info', 'Create Deposit... Confirm transaction')
    createDeposit({
      activeWeb3: injectedWeb3,
      address: contractAddress,
      amount: '0x' + new BigNumber(toWei(amount, tokenInfo.decimals)).toString(16),
      lockPeriods: lockMonths,
      onTrx: (txHash) => {
        addNotification('info', 'Transaction', getTransactionLink(chainId, txHash), getShortTxHash(txHash))
      },
      onSuccess: (txInfo) => {
        addNotification('success', `New deposit succesfull created`)
        setIsCreateDeposit(false)
        updateUserState()
        updateState()
        setShowSuccess(true)
      },
      onError: () => {}
    }).catch((err) => {
      addNotification('error', 'Fail create deposit')
      setIsCreateDeposit(false)
    })
  }
  const [ isApproving, setIsApproving ] = useState(false)
  const handleApprove = () => {
    setIsApproving(true)
    console.log('>> approve amount', toWei(amount, tokenInfo.decimals))
    addNotification('info', `Approving ${tokenSymbol()}. Confirm transaction`)
    approveToken({
      activeWallet: injectedAccount,
      activeWeb3: injectedWeb3,
      tokenAddress: tokenInfo.address,
      approveFor: contractAddress,
      weiAmount: '0x' + new BigNumber(toWei(amount, tokenInfo.decimals)).toString(16),
      onTrx: (txHash) => {
        addNotification('info', 'Approving transaction', getTransactionLink(chainId, txHash), getShortTxHash(txHash))
      },
      onError: () => {
        addNotification('error', 'Fail approving')
        setIsApproving(false)
      }
    }).then((res) => {
      addNotification('success', `Token ${tokenSymbol()} successfull approved`)
      setIsApproving(false)
      updateUserState()
    }).catch((err) => {})
  }
  const isNeedApprove = (
    amount != ''
    && tokenInfo
    && new BigNumber(toWei(amount, tokenInfo.decimals)).isGreaterThan(userSummaryInfo.tokenAllowance)
  ) ? true : false

  const createDepositClassName = "w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
  
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <DepositSuccess
          amount={amount}
          lockMonths={lockMonths}
          estimatedReward={estimatedReward}
          tokenSymbol={tokenSymbol()}
          onOk={() => setShowSuccess(false)}
        />
      </motion.div>
    )
  }
  return (
    <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Create New Deposit</h2>
      
      <div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {`Amount `}
                {`(Min ${formatAmount(minLockAmount)} ${tokenSymbol()})`}
              </label>
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {`Balance: `}
                  {(isUserSummaryInfoLoaded) ? formatAmount(userSummaryInfo.tokenBalance) : '...'}
                  {` `}{tokenSymbol()}
                </label>
                <a onClick={handleSetMaxAmount} className="block text-sm font-medium text-blue-500 cursor-pointer underline mb-1 ml-2">Max</a>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setFixedAmount(e.target.value)}
                placeholder="0.00"
                disabled={isApproving || isCreateDeposit}
                className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{tokenSymbol()}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Lock Period
            </label>
            <select
              value={lockMonths}
              disabled={isApproving || isCreateDeposit}
              onChange={(e) => {
                setLockMonths(e.target.value);
              }}
              className="w-full px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </div>

          {estimatedReward && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 flex items-center">
                <span className="pr-2" >
                  Estimated reward: <span className="font-semibold">{estimatedReward} {tokenSymbol()}</span>
                </span>
                {isFetchEstimateReward && (
                  <CircleInlineLoader />
                )}
              </p>
            </div>
          )}
          {(chainId !== injectedChainId) ? (
            <SwitchChainButton className={createDepositClassName} title={`For create Deposit, switch chain to {CHAIN_TITLE}`} />
          ) : (
            <>
              {isNeedApprove ? (
                <>
                  <button
                    disabled={isApproving}
                    onClick={handleApprove}
                    className={createDepositClassName}
                  >
                    {isApproving ? `Approving ${tokenSymbol()}` : `Approve ${tokenSymbol()}`}
                  </button>
                </>
              ) : (
                <>
                  <button
                    disabled={!account || !amount || (parseFloat(amount) < 1) || isCreateDeposit}
                    onClick={handleCreateDeposit}
                    className={createDepositClassName}
                  >
                    {isCreateDeposit ? `Creating new Deposit` : `Confirm Deposit`}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
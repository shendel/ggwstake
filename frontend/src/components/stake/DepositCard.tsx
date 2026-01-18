// @ts-nocheck
import { useState } from 'react';
import { fromWei } from '@/helpers/wei';
import BigNumber from 'bignumber.js';
import {
  formatAmount,
  formatMonth,
  formatDate
} from '@/helpers_stake/'
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import InsufficientFundsAlert from './InsufficientFundsAlert'
import CircleInlineLoader from '@/components/CircleInlineLoader'
import { useModal } from '@/contexts/ModalContext'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useNotification } from '@/contexts/NotificationContext'
import { useStakeContext } from '@/contexts/StakeContext'
import safeDeposit from '@/helpers_stake/safeDeposit'
import withdrawSavedReward from '@/helpers_stake/withdrawSavedReward'
import withdrawRewardOnly from '@/helpers_stake/withdrawRewardOnly'
import withdrawRewardAndClose from '@/helpers_stake/withdrawRewardAndClose'


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

export default function DepositCard(props: DepositCardProps) {
  const {
    deposit,
    months,
    tokenSymbol,
    tokenDecimals,
    currentMonth,
    globalRateBps,
    bankAmount,
    setActiveTab,
  } = props
  
  const {
    injectedChainId,
    injectedWeb3,
    injectedAccount,
  } = useInjectedWeb3()
  
  const {
    chainId,
    contractAddress,
    updateUserState,
    updateUserDeposits
  } = useStakeContext()
  const { addNotification } = useNotification()
  const {
    openModal,
    closeModal,
  } = useModal()
  
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showInsufficientFundsAlert, setShowInsufficientFundsAlert] = useState(false)

  const getMonthsById = (monthId) => {
    return months.find((month) => { return (Number(month.monthId) == Number(monthId)) })
  }
  const formatAmount = (weiAmount: string) => {
    if (!weiAmount) return '0.00';
    return new BigNumber(fromWei(weiAmount, tokenDecimals)).toFixed(4).replace(/\.0*$|(?<=\.\d*)0*$/, "");
  }
  // Определяем, заблокирован ли депозит
  const isLocked = Number(deposit.unlockMonthIndex) > Number(currentMonth);
  const isClosed = !deposit.active
  const isSaved = !deposit.active && deposit.isSaved
  
  const unlockMonthInfo = getMonthsById(deposit.unlockMonthIndex)
  // Определяем тип ставки
  const effectiveRate = deposit.ownRate ? '0' : Number(deposit.rate) || globalRateBps;

  const hasSufficientFunds = (new BigNumber(bankAmount).isGreaterThan(deposit.pendingReward)) ? true : false
  const [ isWithdrawing, setIsWithdrawing ] = useState(false)
  
  const handleWithdrawRewardOnly = () => {
    openModal({
      title: 'Confirm action',
      description: (
        <>
          <div>
            {`Withdraw pending reward `}
            <span className="font-bold">
              {`${formatAmount(deposit.pendingReward)} ${tokenSymbol}`}
            </span>
          </div>
          <div>{`From deposit #${deposit.depositId}?`}</div>
        </>
      ),
      onConfirm: () => {
        setIsWithdrawing(true)
        addNotification('info', `Withdraw reward from deposit #${deposit.depositId}... Confirm transaction`)
        withdrawRewardOnly({
          activeWeb3: injectedWeb3,
          address: contractAddress,
          depositId: deposit.depositId,
          onTrx: (txHash) => {
            addNotification('info', 'Transaction', getTransactionLink(chainId, txHash), getShortTxHash(txHash))
          },
          onSuccess: (txInfo) => {
            addNotification('success', `Reward withdrawed.`)
            setIsWithdrawing(false)
            setShowWithdraw(false)
            updateUserDeposits()
          },
          onError: () => {}
        }).catch((err) => {
          addNotification('error', 'Fail withdraw reward')
          setIsWithdrawing(false)
        })
      }
    })
  }
  
  const handleWithdrawRewardAndClose = () => {
    openModal({
      title: 'Confirm action',
      description: (
        <>
          <div>
            {`Withdraw Principal + Reward`}
          </div>
          <div className="font-bold">
            {new BigNumber(formatAmount(deposit.amount)).plus(formatAmount(deposit.pendingReward)).toFixed(4)} {tokenSymbol}
          </div>
          <div>{`From deposit #${deposit.depositId}`}</div>
          <div>{`And close deposit?`}</div>
        </>
      ),
      onConfirm: () => {
        setIsWithdrawing(true)
        addNotification('info', `Withdraw Principal + Reward from deposit #${deposit.depositId}... Confirm transaction`)
        withdrawRewardAndClose({
          activeWeb3: injectedWeb3,
          address: contractAddress,
          depositId: deposit.depositId,
          onTrx: (txHash) => {
            addNotification('info', 'Transaction', getTransactionLink(chainId, txHash), getShortTxHash(txHash))
          },
          onSuccess: (txInfo) => {
            addNotification('success', `Principal + Reward withdrawed. Deposit closed.`)
            setIsWithdrawing(false)
            setShowWithdraw(false)
            updateUserDeposits()
            setActiveTab('closed')
          },
          onError: () => {}
        }).catch((err) => {
          addNotification('error', 'Fail withdraw reward')
          setIsWithdrawing(false)
        })
      }
    })
  }
  
  const handleWithdrawSafeReward = () => {
    openModal({
      title: 'Confirm action',
      description: (
        <>
          <div>
            {`Withdraw pending reward `}
            <span className="font-bold">
              {`${formatAmount(deposit.savedReward)} ${tokenSymbol}`}
            </span>
          </div>
          <div>{`From deposit #${deposit.depositId}?`}</div>
        </>
      ),
      onConfirm: () => {
        setIsWithdrawing(true)
        addNotification('info', `Withdraw reward from deposit #${deposit.depositId}... Confirm transaction`)
        withdrawSavedReward({
          activeWeb3: injectedWeb3,
          address: contractAddress,
          depositId: deposit.depositId,
          onTrx: (txHash) => {
            addNotification('info', 'Transaction', getTransactionLink(chainId, txHash), getShortTxHash(txHash))
          },
          onSuccess: (txInfo) => {
            addNotification('success', `Reward withdrawed. Deposit #${deposit.depositId} closed`)
            setIsWithdrawing(false)
            setShowWithdraw(false)
            setActiveTab('closed')
            updateUserDeposits()
          },
          onError: () => {}
        }).catch((err) => {
          addNotification('error', 'Fail withdraw reward')
          setIsWithdrawing(false)
        })
      }
    })
  }
  const handleSafeDeposit = () => {
    setIsWithdrawing(true)
    addNotification('info', `Closing deposit #${deposit.depositId}... Confirm transaction`)
    safeDeposit({
      activeWeb3: injectedWeb3,
      address: contractAddress,
      depositId: deposit.depositId,
      onTrx: (txHash) => {
        addNotification('info', 'Transaction', getTransactionLink(chainId, txHash), getShortTxHash(txHash))
      },
      onSuccess: (txInfo) => {
        addNotification('success', `Deposit #${deposit.depositId} closed`)
        setIsWithdrawing(false)
        setActiveTab('closed')
        setShowWithdraw(false)
        updateUserDeposits()
      },
      onError: () => {}
    }).catch((err) => {
      addNotification('error', 'Fail close deposit')
      setIsWithdrawing(false)
    })
  }
  const handleWithdrawButtonClick = () => {
    if (!hasSufficientFunds) {
      openModal({
        title: `Withdraw`,
        hideBottomButtons: true,
        fullWidth: true,
        alertStyle: true,
        id: 'WITHDRAW_NO_FUNDS',
        content: (
          <InsufficientFundsAlert
            depositAmount={formatAmount(deposit.amount)}
            pendingReward={formatAmount(deposit.pendingReward)}
            tokenSymbol={tokenSymbol}
            onWithdrawPrincipal={() => {
              closeModal('WITHDRAW_NO_FUNDS')
              handleSafeDeposit()
            }}
            onClose={() => closeModal('WITHDRAW_NO_FUNDS')}
          />
        )
      })
    } else {
      setShowWithdraw(true)
    }
  }
  return (
    <div className="bg-gray-800 shadow-lg border border-gray-700 rounded-xl p-4 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white">{formatAmount(deposit.amount)} {tokenSymbol}</h3>
            {/*
            <p className="text-sm text-gray-300 mt-1">
              Locked until month #{deposit.unlockMonthIndex}
            </p>
            */}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isClosed
              ? isSaved
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              : isLocked ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
          }`}>
            {isClosed
              ? isSaved
                ? hasSufficientFunds
                  ? 'Reward aviable'
                  : 'Wait Reward in Bank'
                : 'Closed'
              : isLocked ? 'Locked' : 'Unlocked'
            }
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Created At</span>
            <p className="font-medium">{formatDate(deposit.depositStart)}</p>
          </div>
          {(deposit.active || (!deposit.active && deposit.isSaved)) && (
            <div>
              <span className="text-gray-500">Pending Reward</span>
              <p className="font-medium text-green-600">+{formatAmount((deposit.isSaved) ? deposit.savedReward : deposit.pendingReward)} {tokenSymbol}</p>
            </div>
          )}
          {deposit.active ? (
            <div>
              <span className="text-gray-500">{`Unlock Month`}</span>
              <p className="font-medium">
                {unlockMonthInfo ? (
                  <>{formatMonth(unlockMonthInfo.start)}</>
                ) : (
                  <>
                    {`#${deposit.unlockMonthIndex}`}
                  </>
                )}
              </p>
            </div>
          ) : (
            <div>
              <span className="text-gray-500">Closed At</span>
              <p className="font-medium">{formatDate(deposit.depositClosed)}</p>
            </div>
          )}
          {(deposit.active || (!deposit.active && deposit.isSaved)) && (
            <div>
              <span className="text-gray-500">Rate</span>
              <p className="font-medium">{effectiveRate} bps</p>
            </div>
          )}
        </div>
        {!showWithdraw && (deposit.active || deposit.isSaved) && (
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleWithdrawButtonClick}
              disabled={(new BigNumber(deposit.pendingReward).isEqualTo(0))}
              className="font-bold flex-1 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Withdraw
            </button>
            {/*
            <button className="flex-1 py-1.5 text-sm bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 rounded">
              Details
            </button>
            */}
          </div>
        )}
      </div>
      {showWithdraw && (
        <div className="border-t p-4 bg-gray-900">
          <h4 className="font-medium text-gray-200 text-center mb-2">Withdraw Options</h4>
          {hasSufficientFunds ? (
            <div className="space-y-2">
              {!deposit.active && deposit.isSaved ? (
                <button 
                  className="flex items-center justify-center font-bold w-full text-left py-1.5 px-3 bg-green-600 border border-green-900 hover:text-white rounded hover:bg-green-500 text-sm"
                  onClick={handleWithdrawSafeReward}
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? (
                    <>
                      <CircleInlineLoader />
                      <span>{`Withdrawing...`}</span>
                    </>
                  ) : (
                    <span>
                      Withdraw Reward ({formatAmount(deposit.savedReward)} {tokenSymbol})
                    </span>
                  )}
                </button>
              ) : (
                <>
                  <button
                    className="flex items-center justify-center text-center font-bold w-full text-left py-1.5 px-3 bg-green-600 border border-green-900 hover:text-white rounded hover:bg-green-500 text-sm"
                    disabled={isWithdrawing}
                    onClick={handleWithdrawRewardOnly}
                  >
                    {isWithdrawing ? (
                      <>
                        <CircleInlineLoader />
                        <span>{`Withdrawing...`}</span>
                      </>
                    ) : (
                      <span>
                        Rewards only ({formatAmount(deposit.pendingReward)} {tokenSymbol})
                      </span>
                    )}
                  </button>
                  <button 
                    disabled={isLocked || isWithdrawing}
                    onClick={handleWithdrawRewardAndClose}
                    className="flex items-center justify-center  text-center font-bold w-full text-left py-1.5 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm"
                  >
                    {isWithdrawing ? (
                      <>
                        <CircleInlineLoader />
                        <span>{`Withdrawing...`}</span>
                      </>
                    ) : (
                      <span>
                        Principal + Rewards ({new BigNumber(formatAmount(deposit.amount)).plus(formatAmount(deposit.pendingReward)).toFixed(4)} {tokenSymbol})
                      </span>
                    )}
                  </button>
                </>
              )}
              <button 
                onClick={() => setShowWithdraw(false)}
                disabled={isWithdrawing}
                className="text-center font-bold text-center w-full text-left py-1.5 px-3 bg-red-600 border border-red-900 hover:text-white rounded hover:bg-red-500 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              Safe 
            </div>
          )}
        </div>
      )}
    </div>
  );
}
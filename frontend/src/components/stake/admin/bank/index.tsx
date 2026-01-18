import { useEffect, useState } from 'react'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useModal } from '@/contexts/ModalContext'
import { useNotification } from "@/contexts/NotificationContext";
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import StakeBankDeposit from './Deposit'
import StakeBankWithdraw from './Withdraw'
import addTokensToBank from '@/helpers_stake/addTokensToBank'
import withdrawTokensFromBank from '@/helpers_stake/withdrawTokensFromBank'
import approveToken from '@/helpers/approveToken'
import fetchTokenBalance from '@/helpers/fetchTokenBalance'
import fetchTokenAllowance from '@/helpers/fetchTokenAllowance'
import { useStakeContext } from '@/contexts/StakeContext'

const StakeBank = (props) => {
  const {
    chainId: MAINNET_CHAIN_ID,
    contractAddress: CONTRACT,
    summaryInfo,
    summaryInfo: {
      bankAmount,
      estimateRequiredBankReservePrecise: pendingAmount,
    },
    tokenInfo: {
      address: tokenAddress,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
    },
    updateState
  } = useStakeContext()

  const { addNotification } = useNotification()
  const { openModal, closeModal } = useModal()
  const {
    isConnected,
    injectedWeb3,
    injectedAccount,
    injectedChainId,
    switchNetwork,
    isSwitchingNetwork,
  } = useInjectedWeb3()
  
  const [ userBalance, setUserBalance ] = useState(0)
  const [ userAllowance, setUserAllowance ] = useState(0)
  const [ needUpdateUser, setNeedUpdateUser ] = useState(true)
  const [ isFetchgingUserInfo, setIsFetchingUserInfo ] = useState(true)

  useEffect(() => {
    if (isConnected && injectedAccount && needUpdateUser) {
      setNeedUpdateUser(false)
      setIsFetchingUserInfo(true)
      fetchTokenBalance({
        wallet: injectedAccount,
        tokenAddress,
        chainId: MAINNET_CHAIN_ID
      }).then(({ wei }) => {
        setUserBalance(wei)
        
        fetchTokenAllowance({
          from: injectedAccount,
          to: CONTRACT,
          tokenAddress,
          chainId: MAINNET_CHAIN_ID
        }).then(({ allowance }) => {
          setUserAllowance(allowance)
          setIsFetchingUserInfo(false)
        }).catch((err) => {
          console.log('Fail fetch token allowance')
        })
      }).catch((err) => {
        console.log('Fail fetch token balance')
      })
    }
  }, [ isConnected, injectedAccount, needUpdateUser ])

  const handleClose = () => {
    closeModal('STAKE_BANK_INFO')
  }
  
  const handleAdd = () => {
    openModal({
      title: `Add tokens to Stake Bank`,
      hideBottomButtons: true,
      fullWidth: true,
      id: 'STAKE_BANK_ADD',
      onClose: (data) => {
        
      },
      content: (
        <StakeBankDeposit
          userBalance={userBalance}
          userAllowance={userAllowance}
          tokenDecimals={tokenDecimals}
          tokenSymbol={tokenSymbol}
          onApprove={handleApprove}
          onDeposit={handleDeposit}
          onCancel={() => {
            closeModal('STAKE_BANK_ADD')
          }}
        />
      )
    })
  };

  const handleWithdraw = (amount: number, setLoading: (loading: boolean) => void) => {
    setLoading(true);
    addNotification('info', 'Withdrawing stake bank. Confirm transaction')
    withdrawTokensFromBank({
      activeWeb3: injectedWeb3,
      address: CONTRACT,
      amount: `0x` + new BigNumber(toWei(amount, tokenDecimals)).toString(16),
      onTrx: (txHash) => {
        addNotification('info', 'Withdraw transaction', getTransactionLink(MAINNET_CHAIN_ID, txHash), getShortTxHash(txHash))
      },
      onSuccess: () => {
        addNotification('success', `Successfull withdrawed`)
        setLoading(false)
        closeModal('STAKE_BANK_WITHDRAW')
        closeModal('STAKE_BANK_INFO')
        updateState()
      },
      onError: () => {
        addNotification('error', 'Fail withdraw')
        setLoading(false)
      }
    }).catch((err) => {})
  }
  const openWithdraw = () => {
    openModal({
      title: `Withdraw stake bank`,
      hideBottomButtons: true,
      fullWidth: true,
      id: 'STAKE_BANK_WITHDRAW',
      onClose: (data) => {
        
      },
      content: (
        <StakeBankWithdraw
          bankBalance={bankAmount}
          tokenDecimals={tokenDecimals}
          tokenSymbol={tokenSymbol}
          onWithdraw={handleWithdraw}
          onCancel={() => {
            closeModal('STAKE_BANK_WITHDRAW')
          }}
        />
      )
    })
  };
  const handleApprove = (
    amount: number,
    setLoading: (loading: boolean) => void,
    setAllowance: (newAllowance) => void
  ) => {
    setLoading(true)
    addNotification('info', `Approving ${tokenSymbol}. Confirm transaction`)
    approveToken({
      activeWallet: injectedAccount,
      activeWeb3: injectedWeb3,
      tokenAddress: tokenAddress,
      approveFor: CONTRACT,
      weiAmount: toWei(amount, tokenDecimals),
      onTrx: (txHash) => {
        addNotification('info', 'Approving transaction', getTransactionLink(MAINNET_CHAIN_ID, txHash), getShortTxHash(txHash))
      },
      onSuccess: () => {
        addNotification('success', `Token ${tokenSymbol} successfull approved`)
        setLoading(false)
        setUserAllowance(toWei(amount, tokenDecimals))
        setAllowance(toWei(amount, tokenDecimals))
      },
      onError: () => {
        addNotification('error', 'Fail approving')
        setLoading(false)
      }
    }).catch((err) => {})
  };

  const handleDeposit = (amount: number, setLoading: (loading: boolean) => void) => {
    setLoading(true);
    addNotification('info', 'Add tokens to Stake Bank. Confirm transaction')
    addTokensToBank({
      activeWeb3: injectedWeb3,
      address: CONTRACT,
      amount: `0x` + new BigNumber(toWei(amount, tokenDecimals)).toString(16),
      onTrx: (txHash) => {
        addNotification('info', 'Add tokens transaction', getTransactionLink(MAINNET_CHAIN_ID, txHash), getShortTxHash(txHash))
      },
      onSuccess: () => {
        addNotification('success', `Tokens successfull added`)
        closeModal('STAKE_BANK_ADD')
        closeModal('STAKE_BANK_INFO')
        updateState()
      },
      onError: () => {
        addNotification('error', 'Fail add')
        setLoading(false)
      }
    }).catch((err) => {})
  }
  
  return (
    <div>
      {/* Баланс банка */}
      <div className="mb-6 text-center">
        <p className="text-3xl font-extrabold text-green-400">
          {fromWei(bankAmount, tokenDecimals)}
        </p>
        <p className="text-sm text-gray-400 mt-1">{tokenSymbol}</p>
      </div>

      {/* Кнопки Add / Withdraw */}
      <div className="flex flex-col space-y-3 mb-4">
        <button
          onClick={handleAdd}
          disabled={isFetchgingUserInfo}
          className={`py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition cursor-pointer`}
        >
          {'Add Tokens'}
        </button>

        <button
          onClick={openWithdraw}
          disabled={new BigNumber(bankAmount).isEqualTo(0) || isFetchgingUserInfo}
          className={`py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition  cursor-pointer ${
            (new BigNumber(bankAmount).isEqualTo(0))
              ? 'opacity-70 cursor-not-allowed'
              : ''
          }`}
        >
          {'Withdraw Tokens'}
        </button>
      </div>
      {new BigNumber(pendingAmount).isGreaterThan(0) && (
        <>
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-400 mt-1">{`Estimated amount in this month`}</p>
            <p className="text-3xl font-extrabold text-green-400">
              {fromWei(pendingAmount, tokenDecimals)}
            </p>
            <p className="text-sm text-gray-400 mt-1">{tokenSymbol}</p>
          </div>
          <div className="flex flex-col space-y-3 mb-4">
            <button
              onClick={handleAdd}
              disabled={isFetchgingUserInfo}
              className={`py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition cursor-pointer`}
            >
              {'Add Estimated Tokens'}
            </button>
          </div>
        </>
      )}
      {/* Кнопка Close */}
      <div className="text-center">
        <button
          onClick={handleClose}
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition disabled:bg-gray-800 disabled:text-gray-500"
        >
          {`Close`}
        </button>
      </div>
    </div>
  );
}

export default StakeBank
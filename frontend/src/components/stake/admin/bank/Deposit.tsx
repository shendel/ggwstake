import React, { useState, useEffect } from 'react';
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import SwitchChainButton from '@/components/ui/SwitchChainButton'
import { useStakeContext } from '@/contexts/StakeContext'

const StakeBankDeposit = (props) => {
  const {
    chainId: MAINNET_CHAIN_ID
  } = useStakeContext()
  
  const {
    userBalance,
    userAllowance: _userAllowance,
    tokenSymbol,
    tokenDecimals,
    onApprove,
    maxAmount,
    onDeposit,
    onCancel,
  } = props

  const { injectedChainId } = useInjectedWeb3()
  const isWrongChain = (MAINNET_CHAIN_ID !== injectedChainId) ? true : false
  
  const hasAllowance = true
  const [amount, setAmount] = useState<number | string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ userAllowance, setUserAllowance ] = useState(_userAllowance)
  const [ needApprove, setNeedApprove ] = useState(false)

  useEffect(() => {
    if (new BigNumber(userAllowance).isGreaterThanOrEqualTo(toWei(amount, tokenDecimals))) {
      setNeedApprove(true)
    } else {
      setNeedApprove(false)
    }
  }, [ amount, userAllowance ])
  
  const handleApprove = () => {
    const value = Number(amount);
    if (value > 0 && new BigNumber(toWei(value, tokenDecimals)).isLessThanOrEqualTo(userBalance)) {
      setIsProcessing(true);
      onApprove(
        value,
        (loading) => setIsProcessing(loading),
        (newAllowance) => setUserAllowance(newAllowance)
      );
    }
  };

  const handleDeposit = () => {
    const value = Number(amount);
    if (value > 0 && new BigNumber(toWei(value, tokenDecimals)).isLessThanOrEqualTo(userBalance)) {
      setIsProcessing(true);
      onDeposit(value, (loading) => setIsProcessing(loading));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setAmount(value);
    }
  };

  useEffect(() => {
    if (maxAmount) {
      if (new BigNumber(toWei(amount, tokenDecimals)).isGreaterThan(maxAmount)) {
        setAmount(fromWei(maxAmount, tokenDecimals))
      }
    }
  }, [ amount ])
  return (
    <>
      {/* Баланс пользователя */}
      <div className="mb-2 text-right">
        <span className="text-sm text-gray-400">Your balance: {fromWei(userBalance, tokenDecimals)} {tokenSymbol}</span>
      </div>

      {/* Поле ввода количества токенов */}
      <div className="mb-6 flex items-center">
        <input
          type="number"
          min="0"
          max={(maxAmount) ? fromWei(maxAmount, tokenDecimals) : false}
          value={amount}
          onChange={handleChange}
          disabled={isProcessing}
          placeholder="Enter the number of tokens"
          className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-800 disabled:text-gray-500"
        />
        {maxAmount && (
          <button
            onClick={() => {
              setAmount(fromWei(maxAmount, tokenDecimals))
            }}
            type="button"
            disabled={isProcessing}
            className="ml-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-white disabled:bg-gray-800 disabled:text-gray-500"
          >
            {`MAX`}
          </button>
        )}
      </div>

      {/* Кнопки Approve / Deposit */}
      <div className="space-y-3">
        {isWrongChain ? (
          <SwitchChainButton />
        ) : (
          <>
            {!needApprove ? (
              <button
                onClick={handleApprove}
                disabled={isProcessing || !amount}
                className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center ${
                  isProcessing || !amount ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  'Approve'
                )}
              </button>
            ) : (
              <button
                onClick={handleDeposit}
                disabled={isProcessing || Number(amount) <= 0 || Number(amount) > userBalance}
                className={`w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center ${
                  isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Depositing...</span>
                  </>
                ) : (
                  'Deposit'
                )}
              </button>
            )}
          </>
        )}

        <button
          onClick={onCancel}
          disabled={isProcessing}
          className={`w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition duration-200 ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Cancel
        </button>
      </div>
    </>
  );
};

export default StakeBankDeposit;
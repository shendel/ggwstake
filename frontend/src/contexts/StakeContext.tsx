import { createContext, useContext, useState, useEffect, useRef } from "react"

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import fetchSummaryInfo from '@/helpers_stake/fetchSummaryInfo'
import fetchUserSummary from '@/helpers_stake/fetchUserSummary'
import fetchMonths from '@/helpers_stake/fetchMonths'
import fetchUserDeposits from '@/helpers_stake/fetchUserDeposits'

import BigNumber from "bignumber.js"


const StakeContext = createContext({
  chainId: false,
  contractAddress: false,

  summaryInfo: false,
  isFetchingSummary: true,
  isSummaryLoaded: false,
  isSummaryFetchError: false,

  tokenInfo: false,

  userSummaryInfo: false,
  isFetchUserSummaryInfo: true,
  isUserSummaryFetchError: false,
  isUserSummaryInfoLoaded: false,

  depositMonths: [],
  isDepositMonthsFetching: true,
  isDepositMonthsFetchingError: false,
  isDepositMonthsLoaded: false,
  updateMonthsState: () => {},
  
  userDeposits: [],
  isUserDepositsFetching: true,
  isUserDepositsFetchingError: false,
  isUserDepositsLoaded: false,
  updateUserDeposits: () => {},
  
  updateUserState: () => {},
  updateState: () => {},
})

export const useStakeContext = () => {
  return useContext(StakeContext)
}

export default function StakeProvider(props) {
  const {
    children,
    chainId,
    contractAddress
  } = props

  const {
    isConnected,
    injectedAccount
  } = useInjectedWeb3()

  const [ summaryInfo, setSummaryInfo ] = useState(false)
  const [ isFetchingSummary, setIsFetchingSummary ] = useState(true)
  const [ isSummaryFetchError, setIsSummaryFetchError ] = useState(false)
  const [ isSummaryLoaded, setIsSummaryLoaded ] = useState(false)
  const [ tokenInfo, setTokenInfo ] = useState(false)

  const [ depositMonths, setDepositMonths ] = useState([])
  const [ isDepositMonthsFetching, setIsDepositMonthsFetching ] = useState(true)
  const [ isDepositMonthsFetchingError, setIsDepositMonthsFetchingError ] = useState(false)
  const [ isDepositMonthsLoaded, setIsDepositMonthsLoaded ] = useState(false)
  
  const [ isNeedUpdate, setIsNeedUpdate ] = useState(true)
  
  const _doFetchMonths = () => {
    setIsDepositMonthsFetching(true)
    setIsDepositMonthsFetchingError(false)
    setIsDepositMonthsLoaded(false)
    
    fetchMonths({
      address: contractAddress,
      chainId,
      offset: 0,
      limit: summaryInfo.monthsCount,
      onBatch: (batch, offset, total) => {
        setDepositMonths(prev => {
          let updatedMonths = [...prev];
          
          batch.forEach(newMonth => {
            const existingIndex = updatedMonths.findIndex(
              month => month.monthId === newMonth.monthId
            );
            
            if (existingIndex !== -1) {
              updatedMonths[existingIndex] = newMonth;
            } else {
              updatedMonths.push(newMonth);
            }
          });
          
          return updatedMonths.sort((a, b) => 
            Number(a.start) > Number(b.start) ? 1 : -1
          );
        });
      }
    }).then((months) => {
      setDepositMonths(prev => {
        let updatedMonths = [...prev];
        
        months.forEach(newMonth => {
          const existingIndex = updatedMonths.findIndex(
            month => month.monthId === newMonth.monthId
          );
          
          if (existingIndex !== -1) {
            updatedMonths[existingIndex] = newMonth;
          } else {
            updatedMonths.push(newMonth);
          }
        });
        
        return updatedMonths.sort((a, b) => 
          Number(a.start) > Number(b.start) ? 1 : -1
        );
      });
      
      setIsDepositMonthsFetching(false)
      setIsDepositMonthsLoaded(true)
    }).catch((err) => {
      setIsDepositMonthsFetching(false)
      setIsDepositMonthsFetchingError(true)
    })
  }

  
  useEffect(() => {
    if (summaryInfo && summaryInfo.monthsCount) {
      _doFetchMonths()
    }
  }, [ summaryInfo ])
  
  const [ userDeposits, setUserDeposits ] = useState([])
  const [ isUserDepositsFetching, setIsUserDepositsFetching ] = useState(true)
  const [ isUserDepositsFetchingError, setIsUserDepositsFetchingError ] = useState(false)
  const [ isUserDepositsLoaded, setIsUserDepositsLoaded ] = useState(false)
  
  const _doUserDeposits = () => {
    setIsUserDepositsFetching(true)
    setIsUserDepositsFetchingError(false)
    setIsUserDepositsLoaded(false)
    
    fetchUserDeposits({
      address: contractAddress,
      chainId,
      user: injectedAccount,
      offset: 0,
      limit: userSummaryInfo.depositsCount,
      onBatch: (batch, offset, total) => {
        setUserDeposits(prev => {
          // Создаем копию предыдущего массива
          let updatedDeposits = [...prev];
          
          // Обрабатываем каждый депозит из батча
          batch.forEach(newDeposit => {
            // Ищем индекс существующего депозита с таким же depositId
            const existingIndex = updatedDeposits.findIndex(
              deposit => deposit.depositId === newDeposit.depositId
            );
            
            if (existingIndex !== -1) {
              // Если депозит существует - обновляем его данные
              updatedDeposits[existingIndex] = newDeposit;
            } else {
              // Если депозит не существует - добавляем в массив
              updatedDeposits.push(newDeposit);
            }
          });
          
          // Сортируем по дате старта
          return updatedDeposits.sort((a, b) => 
            Number(a.depositStart) > Number(b.depositStart) ? -1 : 1
          );
        });
      }
    }).then((userDeposits) => {
      setIsUserDepositsFetching(false)
      setIsUserDepositsLoaded(true)
      // Финальное обновление списка с обновлением/добавлением всех депозитов
      setUserDeposits(prev => {
        let updatedDeposits = [...prev];
        
        userDeposits.forEach(newDeposit => {
          const existingIndex = updatedDeposits.findIndex(
            deposit => deposit.depositId === newDeposit.depositId
          );
          
          if (existingIndex !== -1) {
            updatedDeposits[existingIndex] = newDeposit;
          } else {
            updatedDeposits.push(newDeposit);
          }
        });
        
        return updatedDeposits.sort((a, b) => 
          Number(a.depositStart) > Number(b.depositStart) ? -1 : 1
        );
      });
      
      console.log('>>> user deposits', userDeposits)
    }).catch((err) => {
      setIsUserDepositsFetching(false)
      setIsUserDepositsFetchingError(true)
    })
  }

  useEffect(() => {
    console.log('>> userSummaryInfo updated', userSummaryInfo)
    if (userSummaryInfo && userSummaryInfo.depositsCount) {
      _doUserDeposits()
    }
  }, [ userSummaryInfo ])
  
  useEffect(() => {
    if (isNeedUpdate && chainId && contractAddress) {
      setIsNeedUpdate(false)
      setIsFetchingSummary(true)
      setIsSummaryLoaded(false)
      setIsSummaryFetchError(false)
      fetchSummaryInfo({
        chainId,
        address: contractAddress
      }).then((answer) => {
        const { info } = answer
        setSummaryInfo(info)
        setIsFetchingSummary(false)
        setTokenInfo({
          address: info.tokenAddress,
          symbol: info.tokenSymbol,
          decimals: info.tokenDecimals,
          name: info.tokenName
        })
        setIsSummaryLoaded(true)
        console.log('>> summary info', answer)
      }).catch((err) => {
        console.log('fail fetch summary info', err)
        setIsFetchingSummary(false)
        setIsSummaryFetchError(true)
      })
    }
  }, [ chainId, contractAddress, isNeedUpdate ])

  const [ userSummaryInfo, setUserSummaryInfo ] = useState(false)
  const [ isFetchUserSummaryInfo, setIsFetchUserSummaryInfo ] = useState(true)
  const [ isUserSummaryFetchError, setIsUserSummaryFetchError ] = useState(false)
  const [ isUserSummaryInfoLoaded, setIsUserSummaryInfoLoaded ] = useState(false)
  const [ isNeedUpdateUserSummary, setIsNeedUpdateUserSummary ] = useState(true)

  useEffect(() => {
    if (injectedAccount && summaryInfo && isNeedUpdateUserSummary) {
      setIsFetchUserSummaryInfo(true)
      setIsNeedUpdateUserSummary(false)
      setIsUserSummaryInfoLoaded(false)
      setIsUserSummaryFetchError(false)
      fetchUserSummary({
        chainId,
        contractAddress,
        userAddress: injectedAccount,
        tokenAddress: summaryInfo.tokenAddress
      }).then((answer) => {
        setUserSummaryInfo(answer)
        setIsFetchUserSummaryInfo(false)
        setIsUserSummaryInfoLoaded(true)
        _doUserDeposits()
        console.log('>> user summary', answer)
      }).catch((err) => {
        console.log('>> fail fetch user summary', err)
        setIsUserSummaryFetchError(true)
        setIsFetchUserSummaryInfo(false)
        setUserSummaryInfo(false)
      })
    } else {
      setUserSummaryInfo(false)
      setIsFetchUserSummaryInfo(false)
      setIsUserSummaryFetchError(false)
    }
  }, [ injectedAccount, summaryInfo, tokenInfo, isNeedUpdateUserSummary ])

  useEffect(() => {
    setIsNeedUpdateUserSummary(true)
  }, [ injectedAccount ])

  return (
    <StakeContext.Provider value={{
      chainId: chainId,
      contractAddress: contractAddress,
      
      summaryInfo,
      isSummaryLoaded,
      isFetchingSummary,
      isSummaryFetchError,

      tokenInfo,

      userSummaryInfo,
      isFetchUserSummaryInfo,
      isUserSummaryFetchError,
      isUserSummaryInfoLoaded,

      depositMonths,
      isDepositMonthsFetching,
      isDepositMonthsFetchingError,
      isDepositMonthsLoaded,
      updateMonthsState: () => { _doFetchMonths() },

      userDeposits,
      isUserDepositsFetching,
      isUserDepositsFetchingError,
      isUserDepositsLoaded,
      
      updateUserDeposits: () => { _doUserDeposits() },
      updateUserState: () => { setIsNeedUpdateUserSummary(true) },
      updateState: () => { setIsNeedUpdate(true) },
    }}>
      {children}
    </StakeContext.Provider>
  )
}

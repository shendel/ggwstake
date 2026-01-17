import { createContext, useContext, useState, useEffect, useRef } from "react"

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'

import fetchSummaryInfo from '@/helpers_stake/fetchSummaryInfo'
import fetchUserSummary from '@/helpers_stake/fetchUserSummary'
import fetchMonths from '@/helpers_stake/fetchMonths'

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
          const newMonths = [
            ...prev,
            ...batch
          ].sort((a,b) => Number(a.start) > Number(b.start) ? 1 : -1)

          return newMonths
        })
      }
    }).then((months) => {
      setIsDepositMonthsFetching(false)
      setIsDepositMonthsLoaded(true)
      setDepositMonths(months)
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

      updateUserState: () => { setIsNeedUpdateUserSummary(true) },
      updateState: () => { setIsNeedUpdate(true) },
    }}>
      {children}
    </StakeContext.Provider>
  )
}

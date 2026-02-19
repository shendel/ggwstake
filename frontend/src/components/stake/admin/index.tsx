import { useState, useEffect } from 'react'
import { useModal } from '@/contexts/ModalContext'
import StakeBank from './bank/'
import AdminStats from './AdminStats'
import ContractEditor from './ContractEditor'
import BigNumber from "bignumber.js"
import { fromWei, toWei } from '@/helpers/wei'
import { getTransactionLink, getShortTxHash, isValidEvmAddress } from '@/helpers/etherscan'
import { useStakeContext } from '@/contexts/StakeContext'

const GGWStakeAdmin = (props) => {
  const { gotoPage } = props
  const {
    summaryInfo: {
      owner,
      oracle,
      stakeOracle,
      activeDepositsCount,
      estimateRequiredBankReservePrecise,
      bankAmount,
      currentMonth,
      minLockAmount,
      minLockMonths,
      depositsCount,
      depositsAmount,
      rewardsPayed
    },
    depositMonths,
    isDepositMonthsFetching,
    isSummaryLoaded,
    tokenInfo,
    activeDepositsPendingReward,
    estimatedMonthlyRewardsSum,
    updateActiveDeposits,
    updateState
  } = useStakeContext()
  
  const { openModal } = useModal()
  
  const handleManageBank = () => {
    openModal({
      title: `Manage Stake Bank`,
      hideBottomButtons: true,
      fullWidth: true,
      id: 'STAKE_BANK_INFO',
      content: (
        <StakeBank />
      )
    })
  }
  const onStatsClick = (key) => {
    switch(key) {
      case 'currentMonth':
        gotoPage('/admin/managemonths')
        break;
      case 'activeDeposits':
        gotoPage('/admin/deposits/active')
        break;
       case 'deposits':
        gotoPage('/admin/deposits/')
        break;
      case 'pendingReward':
      case 'bankAmount':
        handleManageBank()
        break;
      case 'minLockAmount':
        openModal({
          title: 'Minimum Lock Amount',
          hideBottomButtons: true,
          fullWidth: true,
          id: 'EDIT_CONTRACT_VALUE',
          content: (
            <ContractEditor
              currentValue={fromWei(minLockAmount, tokenInfo.decimals)}
              description={`Minimum token (${tokenInfo.symbol}) amount for deposit`}
              contractFunction={`setMinLockAmount`}
              beforeSave={(value) => {
                return `0x` + new BigNumber(toWei(value, tokenInfo.decimals)).toString(16)
              }}
              checkError={(value) => {
                if (Number(value) < 0) return 'Value must be greater or equal to zero'
                return false
              }}
              isAddress={false}
              afterSave={() => { updateState() }}
            />
          )
        })
        break;
      case 'minLockMonths':
        openModal({
          title: 'Minimum time for Lock',
          hideBottomButtons: true,
          fullWidth: true,
          id: 'EDIT_CONTRACT_VALUE',
          content: (
            <ContractEditor
              currentValue={minLockMonths}
              description={`Minimum time for lock in months`}
              contractFunction={`setMinLockMonths`}
              beforeSave={(value) => {
                return `0x` + new BigNumber(value).toString(16)
              }}
              checkError={(value) => {
                if (Number(value) < 0) return 'Value must be greater or equal to zero'
                return false
              }}
              isAddress={false}
              afterSave={() => { updateState() }}
            />
          )
        })
        break;
      case 'oracle':
      case 'stakeOracle':
      case 'owner':
        let editTitle = ''
        let editMessage = ''
        let editValue = ''
        let editSaveFunc = ''
        switch (key) {
          case 'owner':
            editTitle = `Change Owner of contract`
            editValue = owner
            editMessage = `Enter address of new contract owner`
            editSaveFunc = `transferOwnership`
            break;
          case 'oracle':
            editTitle = `Change Oracle`
            editValue = oracle
            editMessage = `This address/contract can create deposits for users (bridge)`
            editSaveFunc = `setOracle`
            break;
          case 'stakeOracle':
            editTitle = `Change Pool Oracle`
            editValue = oracle
            editMessage = `This address/contract can add tokens to bank`
            editSaveFunc = `setStakeOracle`
            break;
        }
        openModal({
          title: editTitle,
          hideBottomButtons: true,
          fullWidth: true,
          id: 'EDIT_CONTRACT_VALUE',
          content: (
            <ContractEditor
              currentValue={editValue}
              description={editMessage}
              contractFunction={editSaveFunc}
              beforeSave={(value) => {
                return value
              }}
              checkError={(value) => {
                if (!isValidEvmAddress(value)) return 'Enter valid EVM address'
                return false
              }}
              isAddress={true}
              afterSave={() => { updateState() }}
            />
          )
        })
        break;
    }
  }
  return (
    <>
      {/*
      <div>Stake admin</div>
      <button onClick={handleManageBank}>Manage bank</button>
      */}
      <AdminStats
        onClick={onStatsClick}
      />
    </>
  )
}

export default GGWStakeAdmin
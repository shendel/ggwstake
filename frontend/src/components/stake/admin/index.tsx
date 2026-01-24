import { useState, useEffect } from 'react'
import { useModal } from '@/contexts/ModalContext'
import StakeBank from './bank/'
import AdminStats from './AdminStats'

const GGWStakeAdmin = (props) => {
  const { gotoPage } = props

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
      case 'pendingReward':
      case 'bankAmount':
        handleManageBank()
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
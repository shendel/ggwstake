import { useState, useEffect } from 'react'
import { useModal } from '@/contexts/ModalContext'
import StakeBank from './bank/'

const GGWStakeAdmin = (props) => {

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
  return (
    <>
      <div>Stake admin</div>
      <button onClick={handleManageBank}>Manage bank</button>
    </>
  )
}

export default GGWStakeAdmin
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  parseDeposit,
  log,
  formatTimestamp,
  deployStakeFixture,
  resetHardhat
} from './helpers'

before(async () => {
  await resetHardhat();
});

describe("GGWStake", function () {
  describe('Estimated reward for admin', async () => {
    try {
      const options = await loadFixture(deployStakeFixture);
      const {
        owner,
        stake,
        mockToken,
        months
      } = options
      
      
      const depositAmount1 = ethers.parseEther("100");
      await mockToken.mint(owner.address, depositAmount1);
      await mockToken.approve(stake, depositAmount1);
      
      await time.setNextBlockTimestamp(months[0]);
      
      const estimateRequiredBankReserveBefore = await stake.estimateRequiredBankReserve()
      const estimateRequiredBankReservePreciseBefore = await stake.estimateRequiredBankReservePrecise()
      
      await stake.createDeposit(depositAmount1, 1);
      
      const depositAmount2 = ethers.parseEther("100");
      await mockToken.mint(owner.address, depositAmount2);
      await mockToken.approve(stake, depositAmount2);
      
      await stake.createDeposit(depositAmount2, 1);
      
      const totalDeposits = await stake.getTotalDeposits()
      
      log('Estimated reward Before:', 'info')
      log(`>> estimateRequiredBankReserve: ${ethers.formatEther(estimateRequiredBankReserveBefore)}`, 'info')
      log(`>> estimateRequiredBankReservePrecise: ${ethers.formatEther(estimateRequiredBankReservePreciseBefore)}`, 'info')
      
      const estimateRequiredBankReserveAfter = await stake.estimateRequiredBankReserve()
      const estimateRequiredBankReservePreciseAfter = await stake.estimateRequiredBankReservePrecise()
      
      log('Estimated reward After:', 'info')
      log(`>> estimateRequiredBankAfter: ${ethers.formatEther(estimateRequiredBankReserveAfter)}`, 'info')
      log(`>> estimateRequiredBankReserveAfter: ${ethers.formatEther(estimateRequiredBankReservePreciseAfter)}`, 'info')
      
      log(`Total deposits count: ${totalDeposits}`, 'info')
      
      await time.increaseTo(months[1])
      const deposit1Raw = await stake.getDepositById(0)
      const deposit2Raw = await stake.getDepositById(1)
      const deposit1 = parseDeposit(deposit1Raw)
      const deposit2 = parseDeposit(deposit2Raw)
      console.log(deposit1)
      console.log(deposit2)
    } catch (err) {
      console.error(err)
    }
  })
});
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
  describe('Fetch user deposits', async () => {
    try {
      const options = await loadFixture(deployStakeFixture);
      const {
        owner,
        user1,
        user2,
        stake,
        mockToken,
        months
      } = options
      
      
      
      const depositAmount1 = ethers.parseEther("50");
      log(`Create deposit ${ethers.formatEther(depositAmount1)} for user ${owner.address}:`, 'info')
      await mockToken.mint(owner.address, depositAmount1);
      await mockToken.connect(owner).approve(stake, depositAmount1);
      
      await time.setNextBlockTimestamp(months[0]);
      await stake.connect(owner).createDeposit(depositAmount1, 1);
      
      const depositAmount2 = ethers.parseEther("100");
      log(`Create deposit ${ethers.formatEther(depositAmount2)} for user ${user1.address}:`, 'info')
      await mockToken.mint(user1.address, depositAmount2);
      await mockToken.connect(user1).approve(stake, depositAmount2);
      
      await stake.connect(user1).createDeposit(depositAmount2, 1);
      
      log(`Create deposit for user ${user2.address}:`, 'info')
      for (let i = 1; i < 5; i++) {
        let amount = ethers.parseEther(`${(10*i)}`)
        log(`>> Amount: ${ethers.formatEther(amount)}`)
        await mockToken.mint(user2.address, amount);
        await mockToken.connect(user2).approve(stake, amount);
        await stake.connect(user2).createDeposit(amount, 1);
      }
      const totalDeposits = await stake.getTotalDeposits()
      const depositsAmount = await stake.depositsAmount()
      log(`Total deposits count: ${totalDeposits}`, 'info')
      log(`Total deposits amount: ${ethers.formatEther(depositsAmount)}`)
      
      await time.increaseTo(months[1])
      const estimateRequiredBankReserve = await stake.estimateRequiredBankReserve()
      const estimateRequiredBankReservePrecise = await stake.estimateRequiredBankReservePrecise()
      log('Estimated reward After:', 'info')
      log(`>> estimateRequiredBank: ${ethers.formatEther(estimateRequiredBankReserve)}`)
      log(`>> estimateRequiredBankReserve: ${ethers.formatEther(estimateRequiredBankReservePrecise)}`)
      
      const ownerDepositCount = await stake.getUserDepositsCount(owner.address)
      const ownerDepositIds = await stake.getUserDepositsIds(owner.address)
      
      const user1DepositCount = await stake.getUserDepositsCount(user1.address)
      const user1DepositIds = await stake.getUserDepositsIds(user1.address)
      
      const user2DepositCount = await stake.getUserDepositsCount(user2.address)
      const user2DepositIds = await stake.getUserDepositsIds(user2.address)
      
      log(`User ${owner.address} deposits ${ownerDepositCount}`)
      console.log(ownerDepositIds)
      log(`User ${user1.address} deposits ${user1DepositCount}`)
      console.log(user1DepositIds)
      log(`User ${user2.address} deposits ${user2DepositCount}`)
      console.log(user2DepositIds)
      
      log(`Get range of user deposits`)
      const range1 = await stake.getUserDeposits(user2.address, 0, 1)
      log('>> [from:0 limit:1]')
      console.log(range1)
      const range2 = await stake.getUserDeposits(user2.address, 10, 1)
      log('>> [from:10 limit:1]')
      console.log(range2)
      const range3 = await stake.getUserDeposits(user2.address, 1, 2)
      log('>> [from:1 limit:2]')
      console.log(range3)
      const range4 = await stake.getUserDeposits(user2.address, 3, 10)
      log('>> [from:3 limit:10]')
      console.log(range4)
      const range5 = await stake.getUserDeposits(user2.address, 0, 0)
      log('>> [from:0 limit:0]')
      console.log(range5)
    } catch (err) {
      console.error(err)
    }
  })
});
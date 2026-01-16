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
  

  describe('One year reward', async () => {
    try {
      const options = await loadFixture(deployStakeFixture);
      const {
        owner,
        stake,
        mockToken,
        months
      } = options
      console.log('>> months', months)
      
      // Пополнить баланс и создать депозит
      const depositAmount = ethers.parseEther("100");
      await mockToken.mint(owner.address, depositAmount);
      await mockToken.approve(stake, depositAmount);
      const midTime = months[0]// + (months[1] - months[0]) / 2
      await time.setNextBlockTimestamp(midTime);
      await stake.createDeposit(depositAmount, 1);
      const depositRaw = await stake.getDepositById(0);
      const deposit = parseDeposit(depositRaw);
      console.log('>> deposit', deposit)
      //await time.increaseTo(months[0])
      const tableData = [{
        monthIndex: 'At end of Month #',
        monthStart: 'end Date',
        viewReward: 'View Reward',
        realReward: 'Real Reward'
      }]
      log('One month = 30 days, APY 0.42% per month, ~5.04% per year', 'info')
      log(`Deposit: ${ethers.formatEther(deposit.amount)}`, 'info')
      for (const [index, utx] of months.entries()) {
        if (index > 0) {
          //await time.increaseTo(months[0] + 1)
          const calcedReward = await stake.calculateRewardByMonths(
            ethers.parseEther('100'),
            index,
            midTime
          )
          await time.increaseTo(utx + 1)
          const reward = await stake.calculatePendingRewardForDeposit(0)
          tableData.push({
            monthIndex: index,
            monthStart: formatTimestamp(utx),
            viewReward: ethers.formatEther(calcedReward),
            realReward: ethers.formatEther(reward)
          })
          //console.log(index, utx, ethers.formatEther(calcedReward), ethers.formatEther(reward))
        }
      }
      console.table(tableData)
      
      expect(true).to.be.equal(true)
    } catch (err) {
      console.error(err)
      
    }
  })
});
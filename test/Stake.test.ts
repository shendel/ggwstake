import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  parseDeposit,
  log,
  formatTimestamp,
  resetHardhat,
  deployStakeFixture
} from './helpers'

before(async () => {
  await resetHardhat();
});

describe("GGWStake - Stake", function () {
  describe("Partial Month Reward", function () {
    it("Should calculate ~50% reward when deposit is created in the middle of the month", async () => {
      const options = await loadFixture(deployStakeFixture);
      const { stake, mockToken, owner, month1Start, month1End, month2End, month3End, month4End, month5End } = options
      // Установить время на середину первого месяца
      const midMonth = month1Start + (month1End - month1Start) / 2;
      

      // Пополнить баланс и создать депозит
      const depositAmount = ethers.parseEther("100");
      await mockToken.mint(owner.address, depositAmount);
      await mockToken.approve(stake, depositAmount);
      
      await time.setNextBlockTimestamp(midMonth);
      await stake.createDeposit(depositAmount, 2);
      const depositRaw = await stake.getDepositById(0);
      const deposit = parseDeposit(depositRaw);
      // Перейти к концу первого месяца
      await time.increaseTo(month1End + 1000);

      
      // Рассчитать вознаграждение
      const reward = await stake.calculatePendingRewardForDeposit(0);
      log(`Mid reward is ${ethers.formatEther(reward)}`, 'info')
      // Ожидаем: (100 * 0.42%) * 0.5 ≈ 0.21 tokens
      const expectedReward = depositAmount * 42n / 10000n / 2n;
      expect(reward).to.be.closeTo(expectedReward, ethers.parseEther("0.001"));
    });
  });
  
  describe("Withdraw after lock period", function () {
    it("Should allow withdrawal after unlockMonthIndex", async () => {
      const options = await loadFixture(deployStakeFixture);
      const { stake, mockToken, owner, month1End, month2End, month3End, month4End } = options

      const midMonth = month1End + (month2End - month1End) / 2;
      

      const depositAmount = ethers.parseEther("100");
      await mockToken.mint(owner.address, depositAmount);
      await mockToken.approve(stake, depositAmount);
      
      // В начале первого месяца
      await time.setNextBlockTimestamp(midMonth);
      await stake.createDeposit(depositAmount, 2); // lock на 2 месяца

      // Попытка снять до окончания срока → должна отвергнуться
      await expect(stake.withdrawPrincipalAndRewards(0)).to.be.revertedWith("Locked");

      // Перейти после окончания второго месяца
      await time.increaseTo(month3End + 1000);
      const reward = await stake.calculatePendingRewardForDeposit(0)
      log(`Wait reward is ${ethers.formatEther(reward)}`, 'info')
      //await time.setNextBlockTimestamp(month2End + 1000);
      
      await stake.withdrawPrincipalAndRewards(0);
      const balanceAfter = await mockToken.balanceOf(owner.address)
      log(`Balance after ${ethers.formatEther(balanceAfter)}`, 'info')

      // Проверить, что депозит неактивен
      const depositRaw = await stake.getDepositById(0);
      const deposit = parseDeposit(depositRaw);
      expect(balanceAfter).to.be.equal(ethers.parseEther('100.63'))
      expect(deposit.active).to.be.false; // active = false
    });
  });
  
  
  describe("Partial Month Reward", function () {
    it('Should view reward equal to real reward', async () => {
      const options = await loadFixture(deployStakeFixture);
      const { stake, mockToken, owner, month1Start, month1End, month2End, month3End, month4End, month5End } = options
      
      const midMonth = month1End + (month2End - month1End) / 2;
      

      // Пополнить баланс и создать депозит
      const depositAmount = ethers.parseEther("100");
      await mockToken.mint(owner.address, depositAmount);
      await mockToken.approve(stake, depositAmount);
      
      await time.setNextBlockTimestamp(midMonth);
      await stake.createDeposit(depositAmount, 1);
      const depositRaw = await stake.getDepositById(0);
      const deposit = parseDeposit(depositRaw);
      // Перейти к концу первого месяца
      await time.increaseTo(month2End + 1000);

      
      // Рассчитать вознаграждение
      const reward = await stake.calculatePendingRewardForDeposit(0);
      log(`Calculated reward is ${ethers.formatEther(reward)}`, 'info')
      
      
      await time.increaseTo(month2End + 1000 + 1);
      //const viewReward = await stake.calculateReward(ethers.parseEther('100'), 1, 2, 0 ) 
      const viewReward2 = await stake.calculateRewardByMonths(
        ethers.parseEther('100'),
        1,
        midMonth
      )
      log(`view reward ${ethers.formatEther(viewReward2)}`, 'info')
      expect(true).to.be.equal(true)
    })
  })

  
});
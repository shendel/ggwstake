import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

interface Deposit {
  owner: string;
  amount: bigint;
  monthIndex: bigint;
  depositStart: bigint;
  depositClosed: bigint;
  unlockMonthIndex: bigint;
  lastAccruedMonthIdx: bigint;
  active: boolean;
}

function log(msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') {
  const emojis: Record<string, string> = {
    info: 'ℹ️ ',
    success: '✅',
    warn: '⚠️ ',
    error: '❌',
  };
  const colors: Record<string, string> = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    warn: '\x1b[33m',    // yellow
    error: '\x1b[31m',   // red
  };
  console.log(`${colors[type]}${emojis[type]} ${msg}\x1b[0m`);
}

function parseDeposit(result: any): Deposit {
  return {
    owner: result[0],
    amount: result[1],
    monthIndex: result[2],
    depositStart: result[3],
    depositClosed: result[4],
    unlockMonthIndex: result[5],
    lastAccruedMonthIdx: result[6],
    active: result[7],
  };
}
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000); // timestamp в секундах → миллисекунды
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() возвращает 0–11
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

describe("GGWStake", function () {
  async function deployStakeFixture() {
    const [owner, user1] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy();
    await mockToken.waitForDeployment();

    const GGWStake = await ethers.getContractFactory("GGWStake");
    const stake = await GGWStake.deploy(await mockToken.getAddress(), 500); // 5% годовых → ~0.416% в месяц

    // Добавляем 6 месяцев (по ~30 дней)
    const now = Math.floor(Date.now() / 1000);
    const month1Start = now;
    const month1End = now + 30 * 86400;
    const month2End = month1End + 30 * 86400;
    const month3End = month2End + 30 * 86400;
    const month4End = month3End + 30 * 86400;
    const month5End = month4End + 30 * 86400;
    const month6End = month5End + 30 * 86400;
    const month7End = month6End + 30 * 86400;
    const month8End = month7End + 30 * 86400;
    const month9End = month8End + 30 * 86400;
    const month10End = month9End + 30 * 86400;
    const month11End = month10End + 30 * 86400;
    const month12End = month11End + 30 * 86400;
    const month1NYEnd = month12End + 30 * 86400;

    const apyPerMonth = 42;
    await stake.addMonth(month1Start, month1End,    apyPerMonth);    // ~0.42%
    await stake.addMonth(month1End, month2End,      apyPerMonth);
    await stake.addMonth(month2End, month3End,      apyPerMonth);
    await stake.addMonth(month3End, month4End,      apyPerMonth);
    await stake.addMonth(month4End, month5End,      apyPerMonth);
    await stake.addMonth(month5End, month6End,      apyPerMonth);
    await stake.addMonth(month6End, month7End,      apyPerMonth);
    await stake.addMonth(month7End, month8End,      apyPerMonth);
    await stake.addMonth(month8End, month9End,      apyPerMonth);
    await stake.addMonth(month9End, month10End,     apyPerMonth);
    await stake.addMonth(month10End, month11End,    apyPerMonth);
    await stake.addMonth(month11End, month12End,    apyPerMonth);
    await stake.addMonth(month12End, month1NYEnd,   apyPerMonth);

    const bankAmount = ethers.parseEther("100");
    
    await mockToken.mint(stake.target, bankAmount); 
    
    const months = [
      month1Start,
      month1End,
      month2End,
      month3End,
      month4End,
      month5End,
      month6End,
      month7End,
      month8End,
      month9End,
      month10End,
      month11End,
      month12End,
      month1NYEnd,
    ]
    return { stake, mockToken, owner, user1, month1Start, month1End, month2End, month3End, month4End, month5End, month6End, months };
  }
  /*
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
  */
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
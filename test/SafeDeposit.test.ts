import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployStakeFixture, log, parseDeposit } from './helpers';

describe("GGWStake - Safe Deposit & Saved Reward", function () {
  it("Should allow user to save principal when bank has no tokens", async () => {
    const { stake, mockToken, owner, user1, month1Start, month1End } = await loadFixture(deployStakeFixture);

    const depositAmount = ethers.parseEther("100");
    await mockToken.mint(user1.address, depositAmount);
    await mockToken.connect(user1).approve(stake, depositAmount);

    const startBalance = await mockToken.balanceOf(user1.address)

    // Установить время в начало месяца
    await time.setNextBlockTimestamp(month1Start + 1000);
    await stake.connect(user1).createDeposit(depositAmount, 2); // lock на 2 месяца

    // Перемотать время до разблокировки
    await time.increaseTo(month1End + 30 * 86400 + 1000); // > 2 месяца

    // Убедиться, что банк пуст (т.е. bankAmount < reward)
    // Но сначала посчитаем награду
    const reward = await stake.calculatePendingRewardForDeposit(0);
    const bankAmount = await stake.bankAmount()
    log(`Reward amount: ${ethers.formatEther(reward)}`)
    log(`Bank amount: ${ethers.formatEther(bankAmount)}`)
    // Имитируем пустой банк: снимаем все токены
    await stake.connect(owner).withdrawBank(bankAmount);
    log(`Withdraw ok`)
    // Проверяем, что withdrawPrincipalAndRewards не работает
    await expect(stake.connect(user1).withdrawPrincipalAndRewards(0)).to.be.revertedWith("Empty bank");
    

    // Но safeDeposit должен работать
    await expect(() => stake.connect(user1).safeDeposit(0))
      .to.changeTokenBalance(mockToken, user1, depositAmount);

    // Проверить, что депозит теперь isSaved
    const deposit = parseDeposit( await stake.getDepositById(0) );

    expect(deposit.active).to.be.false;
    expect(deposit.isSaved).to.be.true;
    expect(deposit.savedReward).to.equal(reward);
    expect(deposit.amount).to.equal(depositAmount);
  });

  it("Should allow user to claim saved reward when bank is replenished", async () => {
    const { stake, mockToken, owner, user1, month1Start, month1End } = await loadFixture(deployStakeFixture);

    const depositAmount = ethers.parseEther("100");
    await mockToken.mint(user1.address, depositAmount); // + ещё на пополнение банка
    await mockToken.connect(user1).approve(stake, depositAmount);

    // Создать депозит
    await time.setNextBlockTimestamp(month1Start + 1000);
    await stake.connect(user1).createDeposit(depositAmount, 2);

    // Перемотать время и вызвать safeDeposit
    await time.increaseTo(month1End + 30 * 86400 + 1000);
    const reward = await stake.calculatePendingRewardForDeposit(0);
    const bankAmount = await stake.bankAmount()
    log(`Reward amount: ${ethers.formatEther(reward)}`)
    log(`Bank amount: ${ethers.formatEther(bankAmount)}`)
    // Имитируем пустой банк: снимаем все токены
    await stake.connect(owner).withdrawBank(bankAmount);
    log(`Withdraw bank - ok`)
    
    
    await stake.connect(user1).safeDeposit(0);
    const deposit = parseDeposit( await stake.getDepositById(0) );

    expect(deposit.active).to.be.false;
    expect(deposit.isSaved).to.be.true;

    // Теперь банк пополняется

    const needReward = await stake.calculatePendingRewardForDeposit(0);
    log(`Add ${ethers.formatEther(needReward)} to contract`)
    await mockToken.mint(owner.address, needReward)
    await mockToken.approve(stake, needReward)
    await stake.connect(owner).addTokensToBank(needReward)


    // Пользователь может получить награду
    await expect(() => stake.connect(user1).getSavedReward(0))
      .to.changeTokenBalance(mockToken, user1, needReward);

    // Проверить, что флаги сброшены
    const depositAfter = parseDeposit(await stake.getDepositById(0))
    expect(depositAfter.isSaved).to.be.false;
    expect(depositAfter.savedReward).to.equal(0);
  });

  it("Should fail to call getSavedReward if bank has insufficient funds", async () => {
    const { stake, mockToken, owner, user1, month1Start, month1End } = await loadFixture(deployStakeFixture);

    const depositAmount = ethers.parseEther("100");
    await mockToken.mint(user1.address, depositAmount * 2n);
    await mockToken.connect(user1).approve(stake, depositAmount);

    // Создать депозит
    await time.setNextBlockTimestamp(month1Start + 1000);
    await stake.connect(user1).createDeposit(depositAmount, 2);

    await time.increaseTo(month1End + 30 * 86400 + 1000);
    const reward = await stake.calculatePendingRewardForDeposit(0);
    
    log(`Reward amount: ${ethers.formatEther(reward)}`)
    // Имитируем пустой банк: снимаем все токены
    const bankAmount = await stake.bankAmount()
    await stake.connect(owner).withdrawBank(bankAmount);
    const bankAmountAfter = await stake.bankAmount()
    log(`Bank amount: ${ethers.formatEther(bankAmountAfter)}`)
    
    
    await stake.connect(user1).safeDeposit(0);

    // Попробовать получить награду без пополнения банка
    await expect(stake.connect(user1).getSavedReward(0)).to.be.revertedWith("Empty bank");
  });

  it("Should fail to call safeDeposit if deposit is still locked", async () => {
    const { stake, mockToken, owner, user1, month1Start } = await loadFixture(deployStakeFixture);

    const depositAmount = ethers.parseEther("100");
    await mockToken.mint(user1.address, depositAmount);
    await mockToken.connect(user1).approve(stake, depositAmount);

    // Создать депозит
    await time.setNextBlockTimestamp(month1Start + 1000);
    await stake.connect(user1).createDeposit(depositAmount, 2);

    // Попробовать вызвать safeDeposit до разблокировки
    await expect(stake.connect(user1).safeDeposit(0)).to.be.revertedWith("Locked");
  });
  
});
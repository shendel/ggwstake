import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

interface Deposit {
  depositId: bigint;
  owner: string;
  amount: bigint;
  monthIndex: bigint;
  depositStart: bigint;
  depositClosed: bigint;
  unlockMonthIndex: bigint;
  lastAccruedMonthIdx: bigint;
  pendingReward: bigint;
  active: boolean;
  isSaved: boolean;
  savedReward: bigint;
}

const log = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
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

const parseDeposit = (result: any): Deposit => {
  return {
    depositId: result[0],
    owner: result[1],
    amount: result[2],
    monthIndex: result[3],
    depositStart: result[4],
    depositClosed: result[5],
    unlockMonthIndex: result[6],
    lastAccruedMonthIdx: result[7],
    pendingReward: result[8],
    active: result[9],
    isSaved: result[10],
    savedReward: result[11]
  };
}
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // timestamp в секундах → миллисекунды
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() возвращает 0–11
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

const resetHardhat = async () => {
  await ethers.provider.send("hardhat_reset", []);
}

const deployStakeFixture = async () => {
  const [owner, user1, user2 ] = await ethers.getSigners();
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy();
  await mockToken.waitForDeployment();
  
  const GGWStake = await ethers.getContractFactory("GGWStake");
  const apyPerMonth = 42;
  const stake = await GGWStake.deploy(await mockToken.getAddress(), apyPerMonth); // 5% годовых → ~0.416% в месяц
  
  // Добавляем 6 месяцев (по ~30 дней)
  const now = Math.floor(Date.now() / 1000) + 1;
  const month1Start = now + 10;
  const month1End = month1Start + 30 * 86400;
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
  
  await mockToken.mint(owner.address, bankAmount); 
  await mockToken.approve(stake.target, bankAmount)
  await stake.addTokensToBank(bankAmount)
  
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
  return { stake, mockToken, owner, user1, user2, month1Start, month1End, month2End, month3End, month4End, month5End, month6End, months };
}

export {
  parseDeposit,
  log,
  formatTimestamp,
  resetHardhat,
  deployStakeFixture
}
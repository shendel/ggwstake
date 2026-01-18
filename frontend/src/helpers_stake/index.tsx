import { fromWei } from '@/helpers/wei'
import BigNumber from 'bignumber.js';

export const monthsNames = {
  0: 'Jan.',
  1: 'Feb.',
  2: 'Mar.',
  3: 'Apr.',
  4: 'May',
  5: 'Jun.',
  6: 'Jul.',
  7: 'Aug.',
  8: 'Sep.',
  9: 'Oct.',
  10: 'Nov.',
  11: 'Dec.'
}
export const unixToDisplay = (timestamp) => {
  return new Date(Number(timestamp) * 1000).toISOString().slice(0, 16).split('T').join(' ');
}

export const unixToLocal = (timestamp) => {
  const d = new Date(Number(timestamp) * 1000)
  return d.getFullYear()
    + '-' + ((d.getMonth() > 9) ? d.getMonth() : '0' + d.getMonth())
    + '-' + ((d.getDate() > 9) ? d.getDate() : '0' + d.getDate())
    + ' ' + ((d.getHours() > 9) ? d.getHours() : '0' + d.getHours())
    + ':' + ((d.getMinutes() > 9) ? d.getMinutes() : '0' + d.getMinutes())
}

export const displayToUnix = (str) => {
  return Math.floor(new Date(str).getTime() / 1000);
}

export const formatDate = (utx) => {
  const d = new Date(Number(utx) * 1000)
  
  return d.getDate() + ' ' + monthsNames[d.getMonth()] + ' ' + d.getFullYear()
}
export const formatAmount = (weiAmount: string, decimals: number, numbers: number = 4) => {
  if (!weiAmount) return '0.00';
  return new BigNumber(fromWei(weiAmount, decimals)).toFixed(numbers).replace(/\.0*$|(?<=\.\d*)0*$/, "");
}
export const bpsToPercent = (bps) => {
  return Number(bps) / 100;
}

export const formatMonth = (utx) => {
  const d = new Date(Number(utx) * 1000)
  
  return monthsNames[d.getMonth()] + ' ' + d.getFullYear()
}

export default {
  formatMonth,
  formatDate,
  monthsNames,
  unixToDisplay,
  unixToLocal,
  displayToUnix,
  bpsToPercent,
  formatAmount,
}
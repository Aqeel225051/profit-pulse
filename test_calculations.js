import {
  calculateDailyFixedShare,
  calculateRealProfit,
  calculateSavingsAndTakeHome,
  calculateDayBreakdown,
} from './src/utils/calculations.js';
import { formatRupees } from './src/utils/storage.js';

console.log('--- Testing ProfitPulse Calculations ---');

// Spec test:
// earnings ₹3,200, expenses ₹1,100, fixed costs ₹8,000 a month over 25 days (₹320 a day).
// Profit = 3,200 - 1,100 - 320 = ₹1,780.
const totalFixed = 8000;
const workingDays = 25;
const dailyFixedShare = calculateDailyFixedShare(totalFixed, workingDays);
console.log(`Daily fixed share: calculated=${dailyFixedShare}, expected=320 -> ${dailyFixedShare === 320 ? 'PASS' : 'FAIL'}`);

const earnings = 3200;
const expenses = 1100;
const realProfit = calculateRealProfit(earnings, expenses, dailyFixedShare);
console.log(`Real profit: calculated=${realProfit}, expected=1780 -> ${realProfit === 1780 ? 'PASS' : 'FAIL'}`);

// Test formatting
console.log(`Format profit: ${formatRupees(realProfit)} -> ${formatRupees(realProfit) === '₹1,780' ? 'PASS' : 'FAIL'}`);

// Test savings & take-home: 20% of 1780 = 356. Safe to take home = 1780 - 356 = 1424
const { savings, safeToTakeHome } = calculateSavingsAndTakeHome(realProfit, 20);
console.log(`Savings (20%): ${savings}, expected 356 -> ${savings === 356 ? 'PASS' : 'FAIL'}`);
console.log(`Safe to take home: ${safeToTakeHome}, expected 1424 -> ${safeToTakeHome === 1424 ? 'PASS' : 'FAIL'}`);

// Test negative profit: earnings 500, expenses 1000, fixed share 320 -> profit = -820
const loss = calculateRealProfit(500, 1000, 320);
const lossResult = calculateSavingsAndTakeHome(loss, 20);
console.log(`Loss profit: ${loss}, expected -820 -> ${loss === -820 ? 'PASS' : 'FAIL'}`);
console.log(`Loss savings: ${lossResult.savings}, expected 0 -> ${lossResult.savings === 0 ? 'PASS' : 'FAIL'}`);
console.log(`Loss safe to take home: ${lossResult.safeToTakeHome}, expected -820 -> ${lossResult.safeToTakeHome === -820 ? 'PASS' : 'FAIL'}`);

console.log('All calculation tests finished.');

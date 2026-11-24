import { 
  calculateDailyFixedShare,
  calculateRealProfit,
  calculateProfitAllocation,
  calculateDayBreakdown,
  calculateMonthTotals,
  calculateDuesStatus,
  generateInsights,
  calculateEntryStreak
} from './src/utils/calculations.js';

import { 
  generateTeaShopDemoData, 
  generateAutoDriverDemoData 
} from './src/utils/demoData.js';

import { translations, getTranslation } from './src/utils/translations.js';

console.log('==================================================');
console.log('       RUNNING COMPREHENSIVE PROFITPULSE TESTS     ');
console.log('==================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failCount++;
  }
}

// 1. Spec Calculation Check: Tea shop example
// Earnings = 3200, Expenses = 1100, Fixed = 8000, Days = 25 -> FixedShare = 320, Profit = 1780
const dailyFixed = calculateDailyFixedShare(8000, 25);
assert(dailyFixed === 320, 'Daily fixed share (8000 / 25) === 320');

const realProfit = calculateRealProfit(3200, 1100, dailyFixed);
assert(realProfit === 1780, 'Real profit (3200 - 1100 - 320) === 1780');

// 2. Safe to Take Home and Profit Splitting (60% Take-home, 20% Savings, 20% Dues)
const alloc = calculateProfitAllocation(1780, { takeHome: 60, savings: 20, dues: 20 });
assert(alloc.savings === 356, `Savings is 20% of 1780 -> ${alloc.savings} === 356`);
assert(alloc.dues === 356, `Upcoming dues is 20% of 1780 -> ${alloc.dues} === 356`);
assert(alloc.takeHome === 1068, `Safe to take home is 1780 - 356 - 356 -> ${alloc.takeHome} === 1068`);

// 3. Loss scenario: Earnings 600, Expenses 1000, FixedShare 320 -> Loss = -720
const loss = calculateRealProfit(600, 1000, 320);
assert(loss === -720, `Loss calculation (600 - 1000 - 320) === -720`);
const lossAlloc = calculateProfitAllocation(loss, { takeHome: 60, savings: 20, dues: 20 });
assert(lossAlloc.savings === 0, 'Savings on loss is 0');
assert(lossAlloc.dues === 0, 'Dues allocation on loss is 0');
assert(lossAlloc.takeHome === -720, 'Take home on loss is -720');

// 4. Zero / Break-even scenario: Earnings 1420, Expenses 1100, FixedShare 320 -> Profit = 0
const zeroProfit = calculateRealProfit(1420, 1100, 320);
assert(zeroProfit === 0, 'Zero profit break-even === 0');
const zeroAlloc = calculateProfitAllocation(zeroProfit);
assert(zeroAlloc.savings === 0 && zeroAlloc.takeHome === 0, 'Allocations on 0 profit are 0');

// 5. Tea Shop Demo Account Verification
const teaDemo = generateTeaShopDemoData();
assert(teaDemo.profile.role === 'business', 'Tea shop role is business');
assert(teaDemo.profile.isDemo === true, 'Tea shop demo flag is true');
assert(Object.keys(teaDemo.entries).length >= 35, `Tea shop has 35+ days of entries (${Object.keys(teaDemo.entries).length})`);

// Verify today's entry in tea demo
const todayStr = new Date().toISOString().slice(0, 10);
const todayTea = teaDemo.entries[todayStr];
assert(todayTea && todayTea.earnings.total === 3200, `Tea shop today earnings total === 3200 (got ${todayTea?.earnings?.total})`);
const teaDayBreakdown = calculateDayBreakdown(todayTea, teaDemo.fixedCosts, teaDemo.profile.profitSplit);
assert(teaDayBreakdown.realProfit === 1780, `Tea shop today real profit === 1780 (got ${teaDayBreakdown.realProfit})`);
assert(teaDayBreakdown.dailyFixedShare === 320, `Tea shop daily fixed share === 320 (got ${teaDayBreakdown.dailyFixedShare})`);

// 6. Auto Driver Demo Account Verification
const autoDemo = generateAutoDriverDemoData();
assert(autoDemo.profile.role === 'driver', 'Auto driver role is driver');
assert(Object.keys(autoDemo.entries).length >= 35, `Auto driver has 35+ days of entries (${Object.keys(autoDemo.entries).length})`);
const todayAuto = autoDemo.entries[todayStr];
assert(todayAuto && todayAuto.earnings.total === 2000, `Auto driver today earnings total === 2000 (got ${todayAuto?.earnings?.total})`);
const autoDayBreakdown = calculateDayBreakdown(todayAuto, autoDemo.fixedCosts, autoDemo.profile.profitSplit);
assert(autoDayBreakdown.realProfit === 1200, `Auto driver today real profit === 1200 (got ${autoDayBreakdown.realProfit})`);
assert(autoDayBreakdown.dailyFixedShare === 220, `Auto driver daily fixed share === 220 (got ${autoDayBreakdown.dailyFixedShare})`);

// 7. Monthly calculations & Dues tracking
const monthTotals = calculateMonthTotals(teaDemo.entries, teaDemo.fixedCosts, todayStr.slice(0, 7));
assert(monthTotals.totalEarnings > 0, `Month total earnings > 0 (${monthTotals.totalEarnings})`);
assert(monthTotals.totalProfit > 0, `Month total profit > 0 (${monthTotals.totalProfit})`);

const dues = calculateDuesStatus(teaDemo.fixedCosts, teaDemo.entries, todayStr.slice(0, 7));
assert(dues.totalMonthlyDues === 8000, `Tea shop total monthly dues === 8000 (got ${dues.totalMonthlyDues})`);
assert(dues.allocatedSoFar > 0, `Dues allocated so far > 0 (${dues.allocatedSoFar})`);

// 8. Streak & Insights
const streak = calculateEntryStreak(teaDemo.entries);
assert(streak >= 30, `Entry streak calculated properly (${streak} days)`);

const insights = generateInsights(teaDemo.entries, teaDemo.fixedCosts);
assert(insights.hasEnoughData === true, 'Insights hasEnoughData is true');
assert(typeof insights.bestWeekday === 'string', `Best weekday identified: ${insights.bestWeekday}`);
assert(typeof insights.weakestWeekday === 'string', `Weakest weekday identified: ${insights.weakestWeekday}`);

// 9. Translations completeness
assert(translations.en.appName === 'ProfitPulse', 'English appName exists');
assert(translations.ml.appName === 'പ്രോഫിറ്റ്പൾസ്', 'Malayalam appName exists');
assert(getTranslation('ml', 'realDailyProfit') === 'ഇന്നത്തെ യഥാർത്ഥ ലാഭം', 'Malayalam realDailyProfit translated');
assert(getTranslation('ml', 'safeToTakeHomeToday') === 'വീട്ടിലേക്ക് കൊണ്ടുപോകാവുന്നത്', 'Malayalam safeToTakeHomeToday translated');
assert(getTranslation('ml', 'navDashboard') === 'ഡാഷ്‌ബോർഡ്', 'Malayalam navDashboard translated');

console.log(`\n==================================================`);
console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`==================================================`);

if (failCount > 0) {
  process.exit(1);
}

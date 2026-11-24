/**
 * src/utils/calculations.js
 * The ProfitPulse core financial calculations engine.
 * Decoupled from React and storage layers for clean testing and future cloud backends.
 */

/**
 * Calculates the daily share of active monthly fixed costs.
 * Daily fixed share = Total Active Monthly Fixed Costs / Working Days.
 * 
 * Supports both an array of items [{ monthlyAmount, active }] or a numeric total.
 * 
 * @param {Array|number} itemsOrTotal List of items or total monthly cost
 * @param {number} workingDays Number of working days per month (default 25)
 * @returns {number} Daily fixed share in whole rupees (rounded)
 */
export function calculateDailyFixedShare(itemsOrTotal = [], workingDays = 25) {
  const days = Math.max(1, parseInt(workingDays, 10) || 25);
  let totalActive = 0;
  if (typeof itemsOrTotal === 'number') {
    totalActive = Math.max(0, parseInt(itemsOrTotal, 10) || 0);
  } else if (Array.isArray(itemsOrTotal)) {
    totalActive = itemsOrTotal
      .filter((item) => item.active !== false)
      .reduce((sum, item) => sum + (parseInt(item.monthlyAmount, 10) || 0), 0);
  }
  return Math.round(totalActive / days);
}

/**
 * Calculates savings amount and safe to take home cash (simple 2-way).
 * Backward compatible helper for existing calls.
 */
export function calculateSavingsAndTakeHome(realProfit, savingsPercent = 20) {
  const profit = parseInt(realProfit, 10) || 0;
  const percent = Math.max(0, Math.min(100, parseInt(savingsPercent, 10) || 0));

  if (profit <= 0) {
    return {
      savings: 0,
      safeToTakeHome: profit,
    };
  }

  const savings = Math.round(profit * (percent / 100));
  const safeToTakeHome = profit - savings;

  return {
    savings,
    safeToTakeHome,
  };
}

/**
 * Calculates real profit for a day.
 * Real Profit = Total Earnings - Variable Expenses - Daily Fixed Cost Share.
 * 
 * Example: earnings ₹3,200, variable expenses ₹1,100, daily fixed share ₹320.
 * Profit = 3,200 - 1,100 - 320 = ₹1,780.
 * 
 * @param {number} totalEarnings Total earnings (Cash + UPI + Other)
 * @param {number} totalDailyExpenses Sum of variable expenses entered today
 * @param {number} dailyFixedShare Apportioned share of monthly fixed costs
 * @returns {number} Real profit in whole rupees (positive or negative)
 */
export function calculateRealProfit(totalEarnings, totalDailyExpenses, dailyFixedShare) {
  const earnings = parseInt(totalEarnings, 10) || 0;
  const expenses = parseInt(totalDailyExpenses, 10) || 0;
  const fixedShare = parseInt(dailyFixedShare, 10) || 0;
  return earnings - expenses - fixedShare;
}

/**
 * Calculates profit allocation:
 * 1. Safe to Take Home (Default 60%)
 * 2. Savings (Default 20%)
 * 3. Upcoming Dues (Default 20%)
 * 
 * When profit is zero or negative:
 * - Do not allocate positive amounts into savings or dues.
 * - Safe to take home is the balance/loss itself.
 * 
 * @param {number} realProfit Daily real profit
 * @param {Object} profitSplit { takeHome: 60, savings: 20, dues: 20 }
 * @returns {{ takeHome: number, savings: number, dues: number }}
 */
export function calculateProfitAllocation(realProfit, profitSplit = { takeHome: 60, savings: 20, dues: 20 }) {
  const profit = parseInt(realProfit, 10) || 0;
  
  if (profit <= 0) {
    return {
      takeHome: profit,
      savings: 0,
      dues: 0,
    };
  }

  const savingsPct = Math.max(0, Math.min(100, parseInt(profitSplit?.savings, 10) || 20));
  const duesPct = Math.max(0, Math.min(100, parseInt(profitSplit?.dues, 10) || 20));
  
  const savings = Math.round(profit * (savingsPct / 100));
  const dues = Math.round(profit * (duesPct / 100));
  const takeHome = profit - savings - dues;

  return {
    takeHome,
    savings,
    dues,
  };
}

/**
 * Computes full breakdown for a specific daily entry.
 */
export function calculateDayBreakdown(entry, fixedCosts, profitSplit = { takeHome: 60, savings: 20, dues: 20 }) {
  const workingDays = fixedCosts?.workingDays || 25;
  const items = fixedCosts?.items || [];
  
  const totalMonthlyFixed = items.reduce(
    (sum, item) => sum + (parseInt(item.monthlyAmount, 10) || 0),
    0
  );
  const activeMonthlyFixed = items
    .filter((item) => item.active !== false)
    .reduce((sum, item) => sum + (parseInt(item.monthlyAmount, 10) || 0), 0);

  const dailyFixedShare = calculateDailyFixedShare(items, workingDays);

  const cash = entry ? (parseInt(entry.earnings?.cash, 10) || 0) : 0;
  const upi = entry ? (parseInt(entry.earnings?.upi, 10) || 0) : 0;
  const other = entry ? (parseInt(entry.earnings?.other, 10) || 0) : 0;
  const totalEarnings = entry ? (parseInt(entry.earnings?.total, 10) || (cash + upi + other)) : 0;

  const expensesList = entry?.expenses || [];
  const totalDailyExpenses = expensesList.reduce(
    (sum, exp) => sum + (parseInt(exp.amount, 10) || 0),
    0
  );

  const realProfit = entry
    ? calculateRealProfit(totalEarnings, totalDailyExpenses, dailyFixedShare)
    : 0;

  const allocation = calculateProfitAllocation(realProfit, profitSplit);

  return {
    hasEntry: !!entry,
    cash,
    upi,
    other,
    totalEarnings,
    expensesList,
    totalDailyExpenses,
    totalMonthlyFixed,
    activeMonthlyFixed,
    workingDays,
    dailyFixedShare,
    realProfit,
    safeToTakeHome: allocation.takeHome,
    savings: allocation.savings,
    upcomingDuesAllocated: allocation.dues,
    profitSplit,
  };
}

/**
 * Calculates monthly totals for a given month prefix (YYYY-MM).
 */
export function calculateMonthTotals(allEntries = {}, fixedCosts = {}, yearMonth) {
  const ym = yearMonth || new Date().toISOString().slice(0, 7);
  const items = fixedCosts?.items || [];
  const workingDays = fixedCosts?.workingDays || 25;
  const dailyFixedShare = calculateDailyFixedShare(items, workingDays);

  let totalEarnings = 0;
  let totalCash = 0;
  let totalUpi = 0;
  let totalExpenses = 0;
  let totalProfit = 0;
  let totalSavings = 0;
  let totalDuesAllocated = 0;
  let totalTakeHome = 0;
  let daysRecorded = 0;

  const categoryTotals = {};

  Object.entries(allEntries || {}).forEach(([dateStr, entry]) => {
    if (dateStr.startsWith(ym) && entry) {
      const cash = parseInt(entry.earnings?.cash, 10) || 0;
      const upi = parseInt(entry.earnings?.upi, 10) || 0;
      const other = parseInt(entry.earnings?.other, 10) || 0;
      const earnings = parseInt(entry.earnings?.total, 10) || (cash + upi + other);

      const expenses = (entry.expenses || []).reduce((sum, exp) => {
        const amt = parseInt(exp.amount, 10) || 0;
        const cat = exp.category || 'misc';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        return sum + amt;
      }, 0);

      const profit = calculateRealProfit(earnings, expenses, dailyFixedShare);
      const alloc = calculateProfitAllocation(profit);

      totalEarnings += earnings;
      totalCash += cash;
      totalUpi += upi;
      totalExpenses += expenses;
      totalProfit += profit;
      totalSavings += alloc.savings;
      totalDuesAllocated += alloc.dues;
      totalTakeHome += alloc.takeHome;
      daysRecorded += 1;
    }
  });

  const totalFixedCostsMonthly = items.reduce(
    (sum, item) => sum + (parseInt(item.monthlyAmount, 10) || 0),
    0
  );

  return {
    yearMonth: ym,
    daysRecorded,
    totalEarnings,
    totalCash,
    totalUpi,
    totalExpenses,
    totalFixedShareAllocated: daysRecorded * dailyFixedShare,
    totalFixedCostsMonthly,
    totalProfit,
    totalSavings,
    totalDuesAllocated,
    totalTakeHome,
    categoryTotals,
  };
}

/**
 * Calculates upcoming recurring dues and compares with accumulated monthly dues allocation.
 */
export function calculateDuesStatus(fixedCosts = {}, allEntries = {}, yearMonth) {
  const ym = yearMonth || new Date().toISOString().slice(0, 7);
  const items = fixedCosts?.items || [];
  
  const totalMonthlyDues = items
    .filter((i) => i.active !== false)
    .reduce((sum, i) => sum + (parseInt(i.monthlyAmount, 10) || 0), 0);

  // Sum all daily dues allocations in this month
  const monthTotals = calculateMonthTotals(allEntries, fixedCosts, ym);
  const allocatedSoFar = monthTotals.totalDuesAllocated;
  const remainingDue = Math.max(0, totalMonthlyDues - allocatedSoFar);
  
  const isHealthy = allocatedSoFar >= totalMonthlyDues || (monthTotals.daysRecorded > 0 && (allocatedSoFar / monthTotals.daysRecorded) * 25 >= totalMonthlyDues * 0.85);

  return {
    totalMonthlyDues,
    allocatedSoFar,
    remainingDue,
    isHealthy,
  };
}

/**
 * Computes consecutive daily entry streak.
 */
export function calculateEntryStreak(allEntries = {}) {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (allEntries[dateStr]) {
      streak++;
    } else if (i === 0) {
      // If today is not entered yet, check starting from yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Analyzes entries to provide smart actionable insights.
 */
export function generateInsights(allEntries = {}, fixedCosts = {}) {
  const entriesList = Object.values(allEntries || {}).filter(Boolean);
  if (entriesList.length < 5) {
    return {
      hasEnoughData: false,
    };
  }

  // Weekday earnings map
  const weekdayTotals = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const weekdayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let totalRevenue = 0;
  let totalExpenses = 0;
  let fuelExpenses = 0;
  const categoryTotals = {};

  entriesList.forEach((e) => {
    const d = new Date(e.date);
    const day = d.getDay();
    const earnings = parseInt(e.earnings?.total, 10) || 0;
    
    weekdayTotals[day] += earnings;
    weekdayCounts[day] += 1;
    totalRevenue += earnings;

    (e.expenses || []).forEach((exp) => {
      const amt = parseInt(exp.amount, 10) || 0;
      const cat = exp.category || 'misc';
      totalExpenses += amt;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

      if (['petrol', 'diesel', 'cng'].includes(cat)) {
        fuelExpenses += amt;
      }
    });
  });

  // Calculate averages per weekday
  let bestDayIdx = 0;
  let bestDayAvg = -1;
  let weakestDayIdx = 0;
  let weakestDayAvg = Infinity;

  for (let i = 0; i < 7; i++) {
    const avg = weekdayCounts[i] > 0 ? (weekdayTotals[i] / weekdayCounts[i]) : 0;
    if (avg > bestDayAvg && weekdayCounts[i] > 0) {
      bestDayAvg = avg;
      bestDayIdx = i;
    }
    if (avg < weakestDayAvg && weekdayCounts[i] > 0) {
      weakestDayAvg = avg;
      weakestDayIdx = i;
    }
  }

  // Find top expense category
  let topCat = 'none';
  let topCatAmt = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCatAmt) {
      topCatAmt = amt;
      topCat = cat;
    }
  });

  const expenseRatio = totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0;
  const fuelRatio = totalRevenue > 0 ? Math.round((fuelExpenses / totalRevenue) * 100) : 0;
  const streak = calculateEntryStreak(allEntries);

  return {
    hasEnoughData: true,
    bestWeekday: dayNames[bestDayIdx],
    weakestWeekday: dayNames[weakestDayIdx],
    topExpenseCategory: topCat,
    topExpenseAmount: topCatAmt,
    expenseRatio,
    fuelRatio,
    streak,
    totalRevenue,
    totalExpenses,
  };
}

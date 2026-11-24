import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  PiggyBank, 
  Calendar, 
  PlusCircle, 
  ArrowRight,
  ShieldCheck,
  Building,
  Sliders,
  ChevronRight,
  Receipt,
  Sparkles,
  Edit3,
  Flame,
  Info,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  X
} from 'lucide-react';
import { 
  getProfile, 
  getFixedCosts, 
  getDailyEntries, 
  getDailyEntry, 
  getProfitSplit,
  getTargets,
  formatRupees, 
  getLanguage,
  onStorageChange 
} from '../utils/storage';
import { 
  calculateDayBreakdown, 
  calculateMonthTotals,
  calculateDuesStatus,
  generateInsights,
  calculateEntryStreak
} from '../utils/calculations';
import { getTranslation } from '../utils/translations';

export default function DashboardScreen({ 
  onNavigateToDailyEntry, 
  onNavigateToFixedCosts, 
  onNavigateToReports,
  onResetSetup 
}) {
  const lang = getLanguage();
  const t = (key, params) => getTranslation(lang, key, params);

  // Format today as YYYY-MM-DD
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Storage states
  const [profile, setProfile] = useState(() => getProfile());
  const [fixedCosts, setFixedCosts] = useState(() => getFixedCosts());
  const [allEntries, setAllEntries] = useState(() => getDailyEntries());
  const [profitSplit, setProfitSplit] = useState(() => getProfitSplit());
  const [targets, setTargets] = useState(() => getTargets());
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Sync on storage change
  useEffect(() => {
    const unsubscribe = onStorageChange(() => {
      setProfile(getProfile());
      setFixedCosts(getFixedCosts());
      setAllEntries(getDailyEntries());
      setProfitSplit(getProfitSplit());
      setTargets(getTargets());
    });
    return unsubscribe;
  }, []);

  const currentEntry = allEntries[selectedDate] || null;
  const breakdown = calculateDayBreakdown(currentEntry, fixedCosts, profitSplit);
  const currentMonthYM = selectedDate.slice(0, 7);
  const monthTotals = calculateMonthTotals(allEntries, fixedCosts, currentMonthYM);
  const duesStatus = calculateDuesStatus(fixedCosts, allEntries, currentMonthYM);
  const insights = generateInsights(allEntries, fixedCosts);
  const streak = calculateEntryStreak(allEntries);

  const isPositiveProfit = breakdown.realProfit > 0;
  const isZeroProfit = breakdown.realProfit === 0;
  const isLoss = breakdown.realProfit < 0;

  // Format month name (e.g. November 2026)
  const monthName = new Date(selectedDate).toLocaleString(lang === 'ml' ? 'ml-IN' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Recent 5 entries sorted by date descending
  const recentEntries = Object.values(allEntries || {})
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Last 7 days for weekly trend
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const ent = allEntries[dStr];
    const brk = calculateDayBreakdown(ent, fixedCosts, profitSplit);
    last7Days.push({
      dateStr: dStr,
      dayLabel: d.toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-US', { weekday: 'short' }),
      profit: ent ? brk.realProfit : 0,
      hasEntry: !!ent,
    });
  }

  // Target calculations
  const dailyTargetProgress = targets.daily > 0 
    ? Math.min(100, Math.round((breakdown.totalEarnings / targets.daily) * 100))
    : 0;
  const monthlyTargetProgress = targets.monthly > 0
    ? Math.min(100, Math.round((monthTotals.totalEarnings / targets.monthly) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-28 max-w-2xl mx-auto transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-navy-900 dark:bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-slate-900 dark:text-white leading-none">
                ProfitPulse
              </h1>
              {profile?.isDemo && (
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  {t('demoBadge')}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-500 capitalize">
              {profile?.roleTitle || profile?.role || 'Small Business'}
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Demonstration Mode Alert Banner */}
        {profile?.isDemo && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {t('demoNotice')}
              </p>
            </div>
            <button
              type="button"
              onClick={onResetSetup}
              className="text-xs font-black text-amber-800 dark:text-amber-300 underline ml-2 flex-shrink-0"
            >
              {t('changeProfile')}
            </button>
          </div>
        )}

        {/* Consecutive Entry Streak Banner */}
        {streak > 0 && (
          <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-200 fill-amber-200 animate-pulse" />
              <span className="text-xs font-black">
                {streak} {t('streakLabel')}
              </span>
            </div>
            <span className="text-[11px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">
              {t('streakInsight', { days: streak })}
            </span>
          </div>
        )}

        {/* PRIMARY CARD: REAL DAILY PROFIT (Most prominent indicator!) */}
        <div className={`p-5 rounded-3xl border-2 transition-all shadow-md relative overflow-hidden ${
          isPositiveProfit
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-emerald-500 shadow-emerald-700/20'
            : isZeroProfit
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700'
            : 'bg-gradient-to-br from-red-600 to-red-700 text-white border-red-500 shadow-red-700/20'
        }`}>
          {/* Subtle background decoration */}
          <div className="absolute right-[-20px] bottom-[-20px] text-white/10 text-9xl font-black pointer-events-none select-none">
            ₹
          </div>

          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-white/80">
                {t('realDailyProfit')}
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
                {formatRupees(breakdown.realProfit)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFormulaModal(true)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              title={t('profitBreakdown')}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-white/80 font-medium mb-4">
            {isPositiveProfit 
              ? `Real profit earned after deducting variable expenses (${formatRupees(breakdown.totalDailyExpenses)}) and daily fixed share (${formatRupees(breakdown.dailyFixedShare)}).`
              : isZeroProfit
              ? `Break-even day. No profit and no loss.`
              : `Net loss for today. Expenses and fixed cost share exceeded earnings by ${formatRupees(Math.abs(breakdown.realProfit))}.`}
          </p>

          {/* SAFE TO TAKE HOME BREAKDOWN */}
          <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  {t('safeToTakeHomeToday')}
                </span>
              </div>
              <span className="text-lg font-black text-white">
                {formatRupees(breakdown.safeToTakeHome)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-[11px] text-white/90">
              <div>
                <span>{t('takeHomePercent')} ({profitSplit.takeHome}%):</span>
                <div className="font-extrabold text-white">
                  {formatRupees(breakdown.safeToTakeHome)}
                </div>
              </div>
              <div>
                <span>{t('savingsPercent')} ({profitSplit.savings}%):</span>
                <div className="font-extrabold text-white">
                  {formatRupees(breakdown.savings)}
                </div>
              </div>
              <div>
                <span>{t('duesPercent')} ({profitSplit.dues}%):</span>
                <div className="font-extrabold text-white">
                  {formatRupees(breakdown.upcomingDuesAllocated)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Entry Button */}
        <button
          type="button"
          onClick={() => onNavigateToDailyEntry(selectedDate)}
          className="w-full py-3.5 px-4 rounded-2xl bg-navy-900 dark:bg-emerald-600 hover:bg-navy-950 dark:hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>
            {currentEntry ? t('edit') : t('quickAddEntry')} ({selectedDate})
          </span>
        </button>

        {/* Today's Breakdown Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('totalEarnings')}
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {formatRupees(breakdown.totalEarnings)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Cash: {formatRupees(breakdown.cash)} · UPI: {formatRupees(breakdown.upi)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('variableExpenses')}
            </span>
            <div className="text-lg font-black text-red-600 dark:text-red-400">
              {formatRupees(breakdown.totalDailyExpenses)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {breakdown.expensesList.length} items recorded
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('fixedCostShare')}
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {formatRupees(breakdown.dailyFixedShare)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {formatRupees(breakdown.activeMonthlyFixed)} ÷ {breakdown.workingDays}d
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('monthlySavings')}
            </span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatRupees(monthTotals.totalSavings)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Accumulated this month
            </div>
          </div>
        </div>

        {/* Weekly Profit Trend Mini-View */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('profitTrend')} (Last 7 Days)
            </span>
            <button
              type="button"
              onClick={onNavigateToReports}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{t('viewAllReports')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 items-end h-28 pt-4 pb-1">
            {last7Days.map((item) => {
              const heightPct = Math.min(100, Math.max(15, Math.abs(item.profit) / 25));
              const isPos = item.profit > 0;
              const isSelected = item.dateStr === selectedDate;

              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`flex flex-col items-center justify-end h-full group transition-all ${
                    isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 mb-1 group-hover:text-slate-900 dark:group-hover:text-white">
                    {formatRupees(item.profit)}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      item.hasEntry
                        ? isPos
                          ? isSelected ? 'bg-emerald-600' : 'bg-emerald-500'
                          : 'bg-red-500'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                  <span className={`text-[10px] font-extrabold mt-1.5 ${
                    isSelected ? 'text-emerald-600 dark:text-emerald-400 underline' : 'text-slate-400'
                  }`}>
                    {item.dayLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Targets & Financial Planning Section */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('earningsTarget')}
            </span>
          </div>

          {/* Daily Target Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-600 dark:text-slate-300">{t('dailyTarget')}</span>
              <span className="text-slate-900 dark:text-white">
                {formatRupees(breakdown.totalEarnings)} / {formatRupees(targets.daily)} ({dailyTargetProgress}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${dailyTargetProgress}%` }}
                className={`h-full rounded-full transition-all ${
                  dailyTargetProgress >= 100 ? 'bg-emerald-500' : 'bg-navy-900 dark:bg-emerald-600'
                }`}
              />
            </div>
          </div>

          {/* Monthly Target Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-600 dark:text-slate-300">{t('monthlyTarget')}</span>
              <span className="text-slate-900 dark:text-white">
                {formatRupees(monthTotals.totalEarnings)} / {formatRupees(targets.monthly)} ({monthlyTargetProgress}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${monthlyTargetProgress}%` }}
                className={`h-full rounded-full transition-all ${
                  monthlyTargetProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Upcoming Fixed Costs / Dues Tracker */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('upcomingFixedCosts')} ({monthName})
              </span>
              <div className="text-xs text-slate-500 mt-0.5">
                {t('allocatedSoFar')}: <strong className="text-slate-900 dark:text-white">{formatRupees(duesStatus.allocatedSoFar)}</strong> of {formatRupees(duesStatus.totalMonthlyDues)}
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateToFixedCosts}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t('edit')}
            </button>
          </div>

          {/* Insufficient allocation warning */}
          {!duesStatus.isHealthy && duesStatus.totalMonthlyDues > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-900 dark:text-amber-200 font-bold">
                {t('duesWarningInsufficient')}
              </p>
            </div>
          )}

          {/* Dues List */}
          <div className="space-y-2">
            {(fixedCosts.items || []).slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                  <span className="text-[10px] text-slate-400">({t('dueOn')} {item.dueDate || 5}th)</span>
                </div>
                <span className="text-slate-900 dark:text-white font-black">
                  {formatRupees(item.monthlyAmount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Business Insights Section */}
        {insights.hasEnoughData && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('insightsTitle')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">
                  {t('bestWeekday')}
                </span>
                <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                  {insights.bestWeekday}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">
                  {t('topExpenseCategory')}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white capitalize">
                  {t(`categories.${insights.topExpenseCategory}`) || insights.topExpenseCategory.replace(/_/g, ' ')} ({formatRupees(insights.topExpenseAmount)})
                </span>
              </div>

              {insights.fuelRatio > 0 && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 col-span-1 sm:col-span-2">
                  <span className="font-bold text-blue-950 dark:text-blue-200">
                    {t('fuelRatio', { percent: insights.fuelRatio })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Transactions List */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('recentTransactions')}
            </span>
            <button
              type="button"
              onClick={onNavigateToReports}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t('viewAllReports')}
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-3 text-center">
              {t('noEntriesYet')}
            </p>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry) => {
                const brk = calculateDayBreakdown(entry, fixedCosts, profitSplit);
                const isPos = brk.realProfit > 0;
                return (
                  <button
                    key={entry.date}
                    type="button"
                    onClick={() => onNavigateToDailyEntry(entry.date)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors text-left"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {entry.date} {entry.date === todayStr && `(${t('today')})`}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Earnings: {formatRupees(brk.totalEarnings)} · Expenses: {formatRupees(brk.totalDailyExpenses)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-black ${
                        isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatRupees(brk.realProfit)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Take home: {formatRupees(brk.safeToTakeHome)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Formula Explainer Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {t('profitBreakdown')}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                <strong>Real Daily Profit =</strong><br />
                Total Earnings<br />
                - Variable Expenses<br />
                - (Monthly Fixed Costs ÷ Working Days)
              </div>

              <p>
                Small business owners often calculate: <em>Earnings - Daily Expenses = Profit</em>. But at the end of the month, rent, electricity, and loan EMIs arrive, wiping out the "profit".
              </p>
              <p>
                <strong>ProfitPulse deducts your daily fixed cost share every single day</strong> ({formatRupees(breakdown.dailyFixedShare)}/day). That way, when you look at your profit, it's what you truly earned!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFormulaModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs"
            >
              {t('done')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

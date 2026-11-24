import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  PieChart as PieIcon, 
  TrendingUp, 
  Download, 
  ArrowLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  getDailyEntries, 
  getFixedCosts, 
  getProfitSplit, 
  formatRupees, 
  exportDataAsJSON,
  getLanguage 
} from '../utils/storage';
import { 
  calculateDayBreakdown, 
  calculateDailyFixedShare 
} from '../utils/calculations';
import { getTranslation } from '../utils/translations';

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ec4899', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export default function ReportsScreen({ onNavigateToDashboard }) {
  const lang = getLanguage();
  const t = (key, params) => getTranslation(lang, key, params);

  const [filterPeriod, setFilterPeriod] = useState('month'); // 'week', 'month', 'all'
  const allEntries = getDailyEntries();
  const fixedCosts = getFixedCosts();
  const profitSplit = getProfitSplit();

  const dailyFixedShare = calculateDailyFixedShare(fixedCosts.items, fixedCosts.workingDays);

  // Filter and sort entries based on selected period
  const filteredData = useMemo(() => {
    const entriesList = Object.values(allEntries || {})
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const now = new Date();
    if (filterPeriod === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return entriesList.filter((e) => new Date(e.date) >= sevenDaysAgo);
    } else if (filterPeriod === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return entriesList.filter((e) => new Date(e.date) >= thirtyDaysAgo);
    }
    return entriesList;
  }, [allEntries, filterPeriod]);

  // Aggregate stats across filtered period
  const summary = useMemo(() => {
    let totalEarnings = 0;
    let cashEarnings = 0;
    let upiEarnings = 0;
    let totalVariableExpenses = 0;
    let totalRealProfit = 0;
    let totalSavings = 0;
    let totalTakeHome = 0;
    const categoryMap = {};

    filteredData.forEach((entry) => {
      const brk = calculateDayBreakdown(entry, fixedCosts, profitSplit);
      totalEarnings += brk.totalEarnings;
      cashEarnings += brk.cash;
      upiEarnings += brk.upi;
      totalVariableExpenses += brk.totalDailyExpenses;
      totalRealProfit += brk.realProfit;
      totalSavings += brk.savings;
      totalTakeHome += brk.safeToTakeHome;

      (entry.expenses || []).forEach((exp) => {
        const cat = exp.category || 'misc';
        const amt = parseInt(exp.amount, 10) || 0;
        categoryMap[cat] = (categoryMap[cat] || 0) + amt;
      });
    });

    const fixedAllocated = filteredData.length * dailyFixedShare;
    const totalExpenses = totalVariableExpenses + fixedAllocated;

    // Convert category map to chart data array
    const categoryChartData = Object.entries(categoryMap).map(([cat, amt]) => ({
      name: t(`categories.${cat}`) || cat.replace(/_/g, ' '),
      value: amt,
    })).sort((a, b) => b.value - a.value);

    // Chart trend series
    const trendData = filteredData.map((e) => {
      const brk = calculateDayBreakdown(e, fixedCosts, profitSplit);
      return {
        date: e.date.slice(5), // 'MM-DD'
        earnings: brk.totalEarnings,
        expenses: brk.totalDailyExpenses + brk.dailyFixedShare,
        profit: brk.realProfit,
      };
    });

    return {
      count: filteredData.length,
      totalEarnings,
      cashEarnings,
      upiEarnings,
      totalVariableExpenses,
      fixedAllocated,
      totalExpenses,
      totalRealProfit,
      totalSavings,
      totalTakeHome,
      categoryChartData,
      trendData,
    };
  }, [filteredData, fixedCosts, profitSplit, dailyFixedShare, lang]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-28 max-w-2xl mx-auto transition-colors">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onNavigateToDashboard && (
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white leading-none">
              {t('reportsTitle')}
            </h1>
            <span className="text-[11px] font-bold text-slate-500">
              {summary.count} {t('daysUnit')} analyzed
            </span>
          </div>
        </div>

        {/* Export JSON Button */}
        <button
          type="button"
          onClick={exportDataAsJSON}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          title={t('exportData')}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">JSON</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Period Filter Tabs */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            type="button"
            onClick={() => setFilterPeriod('week')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterPeriod === 'week'
                ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t('filterWeek')} (7d)
          </button>
          <button
            type="button"
            onClick={() => setFilterPeriod('month')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterPeriod === 'month'
                ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t('filterMonth')} (30d)
          </button>
          <button
            type="button"
            onClick={() => setFilterPeriod('all')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              filterPeriod === 'all'
                ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t('filterAll')}
          </button>
        </div>

        {/* Aggregated Totals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('totalEarnings')}
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {formatRupees(summary.totalEarnings)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Cash: {formatRupees(summary.cashEarnings)} · UPI: {formatRupees(summary.upiEarnings)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('totalExpenses')}
            </span>
            <div className="text-xl font-black text-red-600 dark:text-red-400">
              {formatRupees(summary.totalExpenses)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Var: {formatRupees(summary.totalVariableExpenses)} + Fixed: {formatRupees(summary.fixedAllocated)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
              {t('realDailyProfit')}
            </span>
            <div className={`text-xl font-black ${
              summary.totalRealProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatRupees(summary.totalRealProfit)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Take-home: {formatRupees(summary.totalTakeHome)} · Savings: {formatRupees(summary.totalSavings)}
            </div>
          </div>
        </div>

        {/* Chart 1: Daily Real Profit Trend (Recharts Area / Bar) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            {t('chartDailyProfit')}
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.trendData}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  formatter={(val) => [formatRupees(val), t('realDailyProfit')]}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#profitGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Earnings vs Total Expenses Over Time (Recharts BarChart) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            {t('chartEarningsExpenses')}
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.trendData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(val) => formatRupees(val)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="earnings" name={t('totalEarnings')} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name={t('totalExpenses')} fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Expense Breakdown by Category (Recharts PieChart) */}
        {summary.categoryChartData.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              {t('chartExpenseBreakdown')}
            </h2>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {summary.categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatRupees(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown table */}
            <div className="space-y-1.5 mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              {summary.categoryChartData.map((cat, idx) => {
                const pct = summary.totalVariableExpenses > 0
                  ? Math.round((cat.value / summary.totalVariableExpenses) * 100)
                  : 0;
                return (
                  <div key={cat.name} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                      />
                      <span className="text-slate-800 dark:text-slate-200 capitalize">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-white font-extrabold">{formatRupees(cat.value)}</span>
                      <span className="text-[11px] text-slate-400 font-normal">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  IndianRupee, 
  Trash2, 
  Plus, 
  CheckCircle, 
  ArrowLeft,
  X,
  CreditCard,
  Banknote,
  Edit2,
  ChevronDown,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { 
  getProfile, 
  saveProfile,
  getDailyEntry, 
  saveDailyEntry, 
  deleteDailyEntry,
  getFixedCosts,
  getProfitSplit,
  formatRupees, 
  sanitizeWholeRupees,
  getLanguage,
  ROLE_PRESETS 
} from '../utils/storage';
import { calculateDayBreakdown } from '../utils/calculations';
import { getTranslation } from '../utils/translations';

export default function DailyEntryScreen({ onNavigateToDashboard, initialDate = null }) {
  const lang = getLanguage();
  const t = (key, params) => getTranslation(lang, key, params);

  const [profile, setProfile] = useState(() => getProfile() || {
    role: 'business',
    expenseButtons: ROLE_PRESETS.business.defaultButtons,
  });

  const fixedCosts = getFixedCosts();
  const profitSplit = getProfitSplit();

  const isBusiness = profile.role === 'business';

  // Format today's date as YYYY-MM-DD
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(initialDate || getTodayStr());
  
  // Earnings inputs
  const [cashInput, setCashInput] = useState('');
  const [upiInput, setUpiInput] = useState('');
  const [otherInput, setOtherInput] = useState('');
  const [totalEarningsInput, setTotalEarningsInput] = useState('');

  // Expenses list state: [ { id, category, amount } ]
  const [expenses, setExpenses] = useState([]);

  // Active expense modal / popup state
  const [activeCategory, setActiveCategory] = useState(null);
  const [expenseAmountInput, setExpenseAmountInput] = useState('');
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // Category management mode
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // UI state
  const [notification, setNotification] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load existing entry when date changes
  useEffect(() => {
    const existing = getDailyEntry(date);
    if (existing) {
      if (isBusiness) {
        setCashInput(existing.earnings?.cash ? String(existing.earnings.cash) : '');
        setUpiInput(existing.earnings?.upi ? String(existing.earnings.upi) : '');
        setOtherInput(existing.earnings?.other ? String(existing.earnings.other) : '');
      } else {
        setTotalEarningsInput(existing.earnings?.total ? String(existing.earnings.total) : '');
        setOtherInput(existing.earnings?.other ? String(existing.earnings.other) : '');
      }
      setExpenses(existing.expenses || []);
    } else {
      setCashInput('');
      setUpiInput('');
      setOtherInput('');
      setTotalEarningsInput('');
      setExpenses([]);
    }
    setErrorMessage('');
    setShowDeleteConfirm(false);
  }, [date, isBusiness]);

  // Derived calculations
  const cashNum = sanitizeWholeRupees(cashInput);
  const upiNum = sanitizeWholeRupees(upiInput);
  const otherNum = sanitizeWholeRupees(otherInput);
  const totalNum = sanitizeWholeRupees(totalEarningsInput);

  const calculatedTotalEarnings = isBusiness
    ? (cashNum + upiNum + otherNum)
    : (totalNum + otherNum);

  const totalExpensesSum = expenses.reduce(
    (sum, exp) => sum + (sanitizeWholeRupees(exp.amount)),
    0
  );

  // Live real profit calculation preview for today
  const mockEntry = {
    date,
    earnings: {
      cash: cashNum,
      upi: upiNum,
      other: otherNum,
      total: calculatedTotalEarnings,
    },
    expenses,
  };
  const liveBreakdown = calculateDayBreakdown(mockEntry, fixedCosts, profitSplit);

  // Expense modal actions
  const handleTapExpenseButton = (category) => {
    setActiveCategory(category);
    setExpenseAmountInput('');
    setEditingExpenseId(null);
    setErrorMessage('');
  };

  const handleEditExpenseItem = (item) => {
    setActiveCategory(item.category);
    setExpenseAmountInput(String(item.amount));
    setEditingExpenseId(item.id);
  };

  const handleSaveExpenseAmount = (e) => {
    e?.preventDefault();
    const amount = sanitizeWholeRupees(expenseAmountInput);
    if (!amount || amount <= 0) {
      setErrorMessage(t('amountPlaceholder'));
      return;
    }

    if (editingExpenseId) {
      setExpenses(expenses.map(exp => exp.id === editingExpenseId ? { ...exp, amount } : exp));
    } else {
      const newExpense = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        category: activeCategory,
        amount,
      };
      setExpenses([...expenses, newExpense]);
    }

    setActiveCategory(null);
    setExpenseAmountInput('');
    setEditingExpenseId(null);
    setErrorMessage('');
  };

  const handleRemoveExpenseItem = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  // Category management
  const handleAddCategory = (e) => {
    e.preventDefault();
    const raw = newCategoryName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!raw) return;
    const currentBtns = profile.expenseButtons || [];
    if (!currentBtns.includes(raw)) {
      const updated = [...currentBtns, raw];
      const newProf = { ...profile, expenseButtons: updated };
      setProfile(newProf);
      saveProfile(newProf);
    }
    setNewCategoryName('');
  };

  const handleDeleteCategory = (cat) => {
    const currentBtns = profile.expenseButtons || [];
    const updated = currentBtns.filter(c => c !== cat);
    const newProf = { ...profile, expenseButtons: updated };
    setProfile(newProf);
    saveProfile(newProf);
  };

  const handleReorderCategory = (index, direction) => {
    const currentBtns = [...(profile.expenseButtons || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentBtns.length) return;
    const temp = currentBtns[index];
    currentBtns[index] = currentBtns[targetIndex];
    currentBtns[targetIndex] = temp;
    const newProf = { ...profile, expenseButtons: currentBtns };
    setProfile(newProf);
    saveProfile(newProf);
  };

  // Save the full daily entry
  const handleSaveDailyRecord = () => {
    const entryData = {
      date,
      earnings: {
        isSplit: isBusiness,
        cash: cashNum,
        upi: upiNum,
        other: otherNum,
        total: calculatedTotalEarnings,
      },
      expenses,
    };

    saveDailyEntry(entryData);
    setNotification(t('entrySavedSuccess'));
    setTimeout(() => {
      onNavigateToDashboard();
    }, 450);
  };

  const handleDeleteRecord = () => {
    deleteDailyEntry(date);
    onNavigateToDashboard();
  };

  const existingEntryForDate = getDailyEntry(date);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-28 max-w-2xl mx-auto transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white leading-none">
              {t('enterDailyRecord')}
            </h1>
            <span className="text-[11px] font-bold text-slate-500 capitalize">
              {profile.roleTitle || profile.role}
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDate(getTodayStr())}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              date === getTodayStr()
                ? 'bg-navy-900 dark:bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('today')}
          </button>
          <button
            type="button"
            onClick={() => setDate(getYesterdayStr())}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              date === getYesterdayStr()
                ? 'bg-navy-900 dark:bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('yesterday')}
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Step 1: Earnings Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('step1Earnings')}
            </span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {formatRupees(calculatedTotalEarnings)}
            </span>
          </div>

          {isBusiness ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  {t('cashEarnings')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  {t('upiEarnings')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={upiInput}
                    onChange={(e) => setUpiInput(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  {t('totalEarnings')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={totalEarningsInput}
                    onChange={(e) => setTotalEarningsInput(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Optional Other Earnings toggle */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              + {t('otherEarnings')}
            </label>
            <div className="relative w-36">
              <span className="absolute left-2.5 top-1 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                inputMode="numeric"
                value={otherInput}
                onChange={(e) => setOtherInput(e.target.value)}
                placeholder="0"
                className="w-full pl-6 pr-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: One-Tap Expense Buttons Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('step2Expenses')}
              </span>
              <p className="text-[11px] text-slate-400">
                {t('tapToAddExpense')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsManagingCategories(!isManagingCategories)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isManagingCategories ? t('done') : t('manageCategories')}</span>
            </button>
          </div>

          {/* Grid of big one-tap buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
            {(profile.expenseButtons || []).map((cat, idx) => (
              <div key={cat} className="relative group">
                <button
                  type="button"
                  onClick={() => handleTapExpenseButton(cat)}
                  className="w-full py-3.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/80 active:scale-[0.98] border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm capitalize transition-all shadow-sm text-center"
                >
                  {t(`categories.${cat}`) || cat.replace(/_/g, ' ')}
                </button>

                {isManagingCategories && (
                  <div className="absolute top-1 right-1 flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-md shadow-md border border-slate-200 dark:border-slate-700 z-10">
                    <button
                      type="button"
                      onClick={() => handleReorderCategory(idx, -1)}
                      disabled={idx === 0}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-20 text-[10px]"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorderCategory(idx, 1)}
                      disabled={idx === (profile.expenseButtons.length - 1)}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-20 text-[10px]"
                      title="Move down"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-red-500 hover:text-red-700 p-0.5"
                      title="Delete category"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Category Form when in management mode */}
          {isManagingCategories && (
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t('categoryNamePlaceholder')}
                className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newCategoryName.trim()}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"
              >
                {t('addCustomCategory')}
              </button>
            </form>
          )}

          {/* Recorded expenses list for today */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400 mb-2">
              <span>{t('totalExpenses')}</span>
              <span className="text-red-600 dark:text-red-400 font-black text-sm">
                {formatRupees(totalExpensesSum)}
              </span>
            </div>

            {expenses.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                {t('noExpensesRecorded')}
              </p>
            ) : (
              <div className="space-y-1.5">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs font-bold"
                  >
                    <span className="text-slate-800 dark:text-slate-200 capitalize">
                      {t(`categories.${exp.category}`) || exp.category.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-white font-extrabold">
                        {formatRupees(exp.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEditExpenseItem(exp)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Edit amount"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExpenseItem(exp.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Remove expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Real Daily Profit Summary Banner */}
        <div className={`p-4 rounded-2xl border ${
          liveBreakdown.realProfit > 0
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60'
            : liveBreakdown.realProfit === 0
            ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800/60'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              {t('realDailyProfit')}
            </span>
            <span className={`text-lg font-black ${
              liveBreakdown.realProfit > 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : liveBreakdown.realProfit === 0
                ? 'text-slate-700 dark:text-slate-300'
                : 'text-red-700 dark:text-red-400'
            }`}>
              {formatRupees(liveBreakdown.realProfit)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div>
              <span>{t('totalEarnings')}:</span>
              <div className="font-extrabold text-slate-800 dark:text-slate-200">
                {formatRupees(liveBreakdown.totalEarnings)}
              </div>
            </div>
            <div>
              <span>{t('totalExpenses')}:</span>
              <div className="font-extrabold text-slate-800 dark:text-slate-200">
                {formatRupees(liveBreakdown.totalDailyExpenses)}
              </div>
            </div>
            <div>
              <span>{t('fixedCostShare')}:</span>
              <div className="font-extrabold text-slate-800 dark:text-slate-200">
                {formatRupees(liveBreakdown.dailyFixedShare)}
              </div>
            </div>
          </div>
        </div>

        {/* Save Entry Action */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleSaveDailyRecord}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{t('saveEntry')}</span>
          </button>

          {existingEntryForDate && (
            <div>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors"
                >
                  {t('deleteEntry')}
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-center space-y-2">
                  <p className="text-xs font-bold text-red-700 dark:text-red-300">
                    {t('confirmDeleteEntry')}
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteRecord}
                      className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-extrabold text-xs shadow-sm"
                    >
                      {t('delete')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pop-up Modal for One-Tap Expense Amount Input */}
      {activeCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-6 duration-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t('addExpenseFor')}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize">
                  {t(`categories.${activeCategory}`) || activeCategory.replace(/_/g, ' ')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpenseAmount}>
              <div className="relative mb-3">
                <span className="absolute left-4 top-3 text-2xl font-black text-slate-400">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  autoFocus
                  value={expenseAmountInput}
                  onChange={(e) => setExpenseAmountInput(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500 text-2xl font-black text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Fast Preset Addition Buttons: +50, +100, +200, +500 */}
              <div className="flex gap-2 mb-4">
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const cur = sanitizeWholeRupees(expenseAmountInput);
                      setExpenseAmountInput(String(cur + amt));
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              {errorMessage && (
                <p className="text-xs text-red-500 font-bold mb-2 text-center">
                  {errorMessage}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-colors"
                >
                  {t('done')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

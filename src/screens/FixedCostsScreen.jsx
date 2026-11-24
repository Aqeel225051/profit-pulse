import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Trash2, 
  Plus, 
  Calendar, 
  CheckCircle,
  HelpCircle,
  IndianRupee,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
  Clock
} from 'lucide-react';
import { 
  getFixedCosts, 
  saveFixedCosts, 
  formatRupees, 
  sanitizeWholeRupees,
  getLanguage,
  onStorageChange 
} from '../utils/storage';
import { calculateDailyFixedShare } from '../utils/calculations';
import { getTranslation } from '../utils/translations';

const PRESET_SUGGESTIONS = [
  'rent',
  'electricity',
  'water',
  'internet',
  'salaries',
  'emi_loan',
  'insurance',
  'licences',
  'other',
];

export default function FixedCostsScreen() {
  const lang = getLanguage();
  const t = (key, params) => getTranslation(lang, key, params);

  const [fixedCostsData, setFixedCostsData] = useState(() => getFixedCosts());
  const [workingDaysInput, setWorkingDaysInput] = useState(
    String(fixedCostsData.workingDays || 25)
  );

  // New item form state
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('5');
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Sync on storage change
  useEffect(() => {
    const unsubscribe = onStorageChange(() => {
      const updated = getFixedCosts();
      setFixedCostsData(updated);
      setWorkingDaysInput(String(updated.workingDays || 25));
    });
    return unsubscribe;
  }, []);

  const totalMonthly = (fixedCostsData.items || []).reduce(
    (sum, item) => sum + (sanitizeWholeRupees(item.monthlyAmount)),
    0
  );

  const activeMonthly = (fixedCostsData.items || [])
    .filter((i) => i.active !== false)
    .reduce((sum, item) => sum + (sanitizeWholeRupees(item.monthlyAmount)), 0);

  const workingDays = Math.max(1, sanitizeWholeRupees(workingDaysInput) || 25);
  const dailyShare = calculateDailyFixedShare(fixedCostsData.items, workingDays);

  const handleWorkingDaysChange = (val) => {
    setWorkingDaysInput(val);
    const parsed = sanitizeWholeRupees(val);
    if (parsed > 0 && parsed <= 31) {
      const updated = {
        ...fixedCostsData,
        workingDays: parsed,
      };
      setFixedCostsData(updated);
      saveFixedCosts(updated);
    }
  };

  const handleAddItem = (e) => {
    e?.preventDefault();
    setError('');
    const nameTrimmed = newName.trim();
    const amountNum = sanitizeWholeRupees(newAmount);
    const dueDayNum = Math.min(31, Math.max(1, parseInt(newDueDate, 10) || 5));

    if (!nameTrimmed) {
      setError('Please enter a cost name.');
      return;
    }
    if (amountNum <= 0) {
      setError('Please enter an amount greater than 0.');
      return;
    }

    const newItem = {
      id: `fc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: nameTrimmed,
      monthlyAmount: amountNum,
      frequency: 'monthly',
      dueDate: dueDayNum,
      active: true,
    };

    const updated = {
      ...fixedCostsData,
      workingDays,
      items: [...(fixedCostsData.items || []), newItem],
    };

    setFixedCostsData(updated);
    saveFixedCosts(updated);

    setNewName('');
    setNewAmount('');
    setNewDueDate('5');
    setSuccessToast('Cost added successfully');
    setTimeout(() => setSuccessToast(''), 2000);
  };

  const handleToggleActive = (id) => {
    const updatedItems = (fixedCostsData.items || []).map((item) => {
      if (item.id === id) {
        return { ...item, active: item.active === false ? true : false };
      }
      return item;
    });

    const updated = { ...fixedCostsData, items: updatedItems };
    setFixedCostsData(updated);
    saveFixedCosts(updated);
  };

  const handleDeleteItem = (id) => {
    const updatedItems = (fixedCostsData.items || []).filter((item) => item.id !== id);
    const updated = { ...fixedCostsData, items: updatedItems };
    setFixedCostsData(updated);
    saveFixedCosts(updated);
  };

  const handleSelectPreset = (presetKey) => {
    const translatedName = t(`fixedCostPresets.${presetKey}`);
    setNewName(translatedName);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-28 max-w-2xl mx-auto transition-colors">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-navy-900 dark:bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white leading-none">
              {t('fixedCostsTitle')}
            </h1>
            <span className="text-[11px] font-bold text-slate-500">
              {t('dailyFixedFormula')}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Daily Share Calculation Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('dailyFixedDeduction')}
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatRupees(dailyShare)} <span className="text-xs font-bold text-slate-500">/ day</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t('totalMonthlyFixed')}
              </span>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatRupees(activeMonthly)}
              </div>
            </div>
          </div>

          {/* Working Days Selector */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                {t('monthlyWorkingDays')}
              </label>
              <span className="text-[11px] text-slate-400">
                {t('workingDaysHelper')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[20, 25, 26, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleWorkingDaysChange(String(d))}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    workingDays === d
                      ? 'bg-navy-900 dark:bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
              <input
                type="number"
                min="1"
                max="31"
                value={workingDaysInput}
                onChange={(e) => handleWorkingDaysChange(e.target.value)}
                className="w-12 h-8 px-1 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Double Deduction Guard Notice */}
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2.5">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
            {t('doubleDeductionNote')}
          </p>
        </div>

        {/* Add New Fixed Cost Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            {t('addFixedCost')}
          </h2>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PRESET_SUGGESTIONS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                + {t(`fixedCostPresets.${preset}`)}
              </button>
            ))}
          </div>

          <form onSubmit={handleAddItem} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t('costNameLabel')}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Shop Rent, Auto EMI"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t('costAmountLabel')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {t('costDueDateLabel')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-bold">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addFixedCost')}</span>
            </button>
          </form>
        </div>

        {/* Existing Fixed Costs List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('fixedCostsTitle')} ({(fixedCostsData.items || []).length})
            </h2>
          </div>

          {(fixedCostsData.items || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              {t('noFixedCostsYet')}
            </p>
          ) : (
            <div className="space-y-2">
              {(fixedCostsData.items || []).map((item) => {
                const isActive = item.active !== false;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                        }`}
                        title={isActive ? t('active') : t('inactive')}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{item.name}</span>
                          {!isActive && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {t('inactive')}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{formatRupees(item.monthlyAmount)} / mo</span>
                          <span>·</span>
                          <span>{t('dueOn')} {item.dueDate || 5}th</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {formatRupees(calculateDailyFixedShare(item.monthlyAmount, workingDays))} / day
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                        title="Delete cost"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

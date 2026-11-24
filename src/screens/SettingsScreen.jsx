import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Sun, 
  Moon, 
  Type, 
  Percent, 
  Target, 
  Sparkles, 
  Trash2, 
  Download, 
  User, 
  Check, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  getProfile, 
  saveProfile, 
  getProfitSplit, 
  saveProfitSplit, 
  getTargets, 
  saveTargets, 
  getLanguage, 
  saveLanguage, 
  getTheme, 
  saveTheme, 
  getLargeText, 
  saveLargeText, 
  loadDemoAccount, 
  resetAllData, 
  exportDataAsJSON,
  formatRupees,
  sanitizeWholeRupees,
  ROLE_PRESETS
} from '../utils/storage';
import { getTranslation } from '../utils/translations';

export default function SettingsScreen({ onResetSetup }) {
  const [lang, setLang] = useState(() => getLanguage());
  const [theme, setTheme] = useState(() => getTheme());
  const [largeText, setLargeText] = useState(() => getLargeText());
  const [profile, setProfile] = useState(() => getProfile() || {});
  const [profitSplit, setProfitSplit] = useState(() => getProfitSplit());
  const [targets, setTargets] = useState(() => getTargets());

  const [toastMessage, setToastMessage] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const t = (key, params) => getTranslation(lang, key, params);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleLangToggle = (newLang) => {
    setLang(newLang);
    saveLanguage(newLang);
    showToast('Language updated');
  };

  const handleThemeToggle = (newTheme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
    showToast('Theme updated');
  };

  const handleLargeTextToggle = () => {
    const nextVal = !largeText;
    setLargeText(nextVal);
    saveLargeText(nextVal);
    showToast('Display size updated');
  };

  const handleSaveProfitSplit = (field, val) => {
    const parsed = Math.max(0, Math.min(100, sanitizeWholeRupees(val)));
    const updated = { ...profitSplit, [field]: parsed };
    setProfitSplit(updated);
    saveProfitSplit(updated);
  };

  const handleSaveTargets = (field, val) => {
    const parsed = sanitizeWholeRupees(val);
    const updated = { ...targets, [field]: parsed };
    setTargets(updated);
    saveTargets(updated.daily, updated.monthly);
  };

  const handleLoadDemo = (type) => {
    loadDemoAccount(type);
    showToast('Demo account loaded');
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const handleReset = () => {
    resetAllData();
    showToast('All data reset');
    setTimeout(() => {
      if (onResetSetup) onResetSetup();
      else window.location.reload();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-28 max-w-2xl mx-auto transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-navy-900 dark:bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white leading-none">
              {t('settingsTitle')}
            </h1>
            <span className="text-[11px] font-bold text-slate-500">
              {profile?.roleTitle || 'Preferences'}
            </span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full shadow-lg">
          {toastMessage}
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('accountProfile')}
            </span>
            <button
              type="button"
              onClick={onResetSetup}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t('changeProfile')}
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                {profile?.roleTitle || 'User'}
              </div>
              <div className="text-xs text-slate-500">
                Category preset: {profile?.role || 'business'}
              </div>
            </div>
          </div>
        </div>

        {/* Language Preference */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('languageSetting')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleLangToggle('en')}
              className={`p-3 rounded-xl border-2 text-xs font-extrabold flex items-center justify-between transition-all ${
                lang === 'en'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>English</span>
              {lang === 'en' && <Check className="w-4 h-4 text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={() => handleLangToggle('ml')}
              className={`p-3 rounded-xl border-2 text-xs font-extrabold flex items-center justify-between transition-all ${
                lang === 'ml'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>മലയാളം</span>
              {lang === 'ml' && <Check className="w-4 h-4 text-emerald-600" />}
            </button>
          </div>
        </div>

        {/* Display & Theme Preferences */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            {t('themeSetting')}
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleThemeToggle('light')}
              className={`p-3 rounded-xl border-2 text-xs font-extrabold flex items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{t('themeLight')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleThemeToggle('dark')}
              className={`p-3 rounded-xl border-2 text-xs font-extrabold flex items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>{t('themeDark')}</span>
            </button>
          </div>

          {/* Large Text Accessibility Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  {t('largeTextMode')}
                </span>
                <span className="text-[11px] text-slate-400">
                  Optimized for mobile readability
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLargeTextToggle}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                largeText ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                largeText ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Profit Allocation Splitting */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('profitSplittingTitle')}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('profitAllocationDesc')}
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {t('takeHomePercent')} (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={profitSplit.takeHome}
                onChange={(e) => handleSaveProfitSplit('takeHome', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {t('savingsPercent')} (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={profitSplit.savings}
                onChange={(e) => handleSaveProfitSplit('savings', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {t('duesPercent')} (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={profitSplit.dues}
                onChange={(e) => handleSaveProfitSplit('dues', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Target Earnings */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('earningsTarget')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {t('dailyTarget')} (₹)
              </label>
              <input
                type="number"
                value={targets.daily}
                onChange={(e) => handleSaveTargets('daily', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                {t('monthlyTarget')} (₹)
              </label>
              <input
                type="number"
                value={targets.monthly}
                onChange={(e) => handleSaveTargets('monthly', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Demonstration Accounts Section */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('demoAccountsSection')}
            </span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleLoadDemo('tea_shop')}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-left text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-between"
            >
              <span>{t('loadTeaShop')}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleLoadDemo('auto_driver')}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-left text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-between"
            >
              <span>{t('loadAutoDriver')}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Data Reset & Export */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <button
            type="button"
            onClick={exportDataAsJSON}
            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('exportData')}</span>
          </button>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-bold transition-colors"
            >
              {t('resetAllData')}
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-2 text-center">
              <p className="text-xs font-bold text-red-700 dark:text-red-300">
                {t('confirmResetData')}
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-extrabold text-xs"
                >
                  {t('confirm')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-400 text-center">
            {t('dataSavedLocally')}
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Store, 
  Car, 
  Wrench, 
  Plus, 
  Check, 
  Trash2, 
  ArrowRight, 
  Sparkles,
  Globe,
  Coffee,
  Navigation
} from 'lucide-react';
import { 
  ROLE_PRESETS, 
  saveProfile, 
  loadDemoAccount, 
  getLanguage, 
  saveLanguage 
} from '../utils/storage';
import { getTranslation } from '../utils/translations';

export default function SetupScreen({ onComplete, initialProfile = null }) {
  const [lang, setLang] = useState(() => getLanguage());
  const [selectedRole, setSelectedRole] = useState(initialProfile?.role || 'business');
  const [selectedSubType, setSelectedSubType] = useState(initialProfile?.roleType || 'tea_shop');
  const [customButtons, setCustomButtons] = useState(initialProfile?.expenseButtons || []);
  const [newCatInput, setNewCatInput] = useState('');

  const t = (key, params) => getTranslation(lang, key, params);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ml' : 'en';
    setLang(nextLang);
    saveLanguage(nextLang);
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    const preset = ROLE_PRESETS[roleId];
    if (preset.subTypes && preset.subTypes.length > 0) {
      setSelectedSubType(preset.subTypes[0].id);
      setCustomButtons([...preset.subTypes[0].defaultButtons]);
    } else {
      setSelectedSubType(roleId);
      setCustomButtons([...preset.defaultButtons]);
    }
  };

  const handleSubTypeChange = (subTypeId) => {
    setSelectedSubType(subTypeId);
    const preset = ROLE_PRESETS[selectedRole];
    const sub = preset.subTypes?.find(s => s.id === subTypeId);
    if (sub) {
      setCustomButtons([...sub.defaultButtons]);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCatInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (!trimmed || customButtons.includes(trimmed)) return;
    setCustomButtons([...customButtons, trimmed]);
    setNewCatInput('');
  };

  const handleRemoveCategory = (cat) => {
    setCustomButtons(customButtons.filter(c => c !== cat));
  };

  const handleLoadDemo = (type) => {
    const data = loadDemoAccount(type);
    if (onComplete) onComplete(data.profile);
  };

  const handleFinishFresh = () => {
    const preset = ROLE_PRESETS[selectedRole];
    const sub = preset.subTypes?.find(s => s.id === selectedSubType);
    const roleTitle = sub ? sub.label : preset.title;

    const profile = {
      role: selectedRole,
      roleType: selectedSubType,
      roleTitle,
      isSetupCompleted: true,
      isDemo: false,
      dailyTarget: selectedRole === 'business' ? 3500 : (selectedRole === 'driver' ? 2000 : 1800),
      monthlyTarget: selectedRole === 'business' ? 80000 : (selectedRole === 'driver' ? 50000 : 45000),
      profitSplit: {
        takeHome: 60,
        savings: 20,
        dues: 20,
      },
      expenseButtons: customButtons.length > 0 ? customButtons : preset.defaultButtons,
      updatedAt: Date.now(),
    };

    saveProfile(profile);
    if (onComplete) onComplete(profile);
  };

  const roles = [
    {
      id: 'business',
      title: t('roleBusiness'),
      desc: t('roleBusinessDesc'),
      icon: Store,
    },
    {
      id: 'driver',
      title: t('roleDriver'),
      desc: t('roleDriverDesc'),
      icon: Car,
    },
    {
      id: 'worker',
      title: t('roleWorker'),
      desc: t('roleWorkerDesc'),
      icon: Wrench,
    },
  ];

  const currentPreset = ROLE_PRESETS[selectedRole];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 max-w-2xl mx-auto flex flex-col justify-between">
      <div>
        {/* Top bar with language switch */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-navy-900 dark:bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              ₹
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white">ProfitPulse</span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>
        </div>

        {/* Intro */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white tracking-tight">
            {t('whatDoYouDo')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5 max-w-md mx-auto">
            {t('selectProfilePrompt')}
          </p>
        </div>

        {/* Instant Demo Accounts Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/80 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('orLoadDemo')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleLoadDemo('tea_shop')}
              className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                  ☕
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600">
                    {t('loadTeaShopDemo')}
                  </div>
                  <div className="text-[11px] text-slate-500">₹3,200/day · ₹1,780 profit</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => handleLoadDemo('auto_driver')}
              className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                  🛺
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600">
                    {t('loadAutoDriverDemo')}
                  </div>
                  <div className="text-[11px] text-slate-500">₹2,000/day · ₹1,200 profit</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-5">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('startFresh')}
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* 3 Main Role Selection Cards */}
        <div className="space-y-3 mb-6">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleChange(r.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {r.title}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sub-Type Selection */}
        {currentPreset.subTypes && currentPreset.subTypes.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              {t('businessTypeLabel')}
            </label>
            <div className="flex flex-wrap gap-2">
              {currentPreset.subTypes.map((sub) => {
                const isSubSelected = selectedSubType === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleSubTypeChange(sub.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSubSelected
                        ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {t(`types.${sub.id}`) || sub.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expense Category Preview & Customization */}
        <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            {t('manageCategories')}
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {t('tapToAddExpense')}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {customButtons.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700"
              >
                <span>{t(`categories.${cat}`) || cat.replace(/_/g, ' ')}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="hover:text-red-500 text-slate-400 ml-0.5"
                  title="Remove category"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom button input */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder={t('categoryNamePlaceholder')}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!newCatInput.trim()}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-2 sticky bottom-4">
        <button
          type="button"
          onClick={handleFinishFresh}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
        >
          <span>{t('getStarted')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

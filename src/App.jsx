import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Building2, 
  BarChart3, 
  Settings,
  Globe,
  Sun,
  Moon,
  Type,
  User,
  Sparkles
} from 'lucide-react';
import { 
  getProfile, 
  onStorageChange, 
  getLanguage, 
  saveLanguage,
  getTheme, 
  saveTheme,
  getLargeText, 
  saveLargeText 
} from './utils/storage';
import { getTranslation } from './utils/translations';
import SetupScreen from './screens/SetupScreen';
import DashboardScreen from './screens/DashboardScreen';
import DailyEntryScreen from './screens/DailyEntryScreen';
import FixedCostsScreen from './screens/FixedCostsScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const [profile, setProfile] = useState(() => getProfile());
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedEntryDate, setSelectedEntryDate] = useState(null);
  const [lang, setLang] = useState(() => getLanguage());
  const [theme, setTheme] = useState(() => getTheme());
  const [largeText, setLargeText] = useState(() => getLargeText());

  // Initialize theme and large-text classes on DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  }, [theme, largeText]);

  // Sync profile & settings when storage changes
  useEffect(() => {
    const unsubscribe = onStorageChange(() => {
      setProfile(getProfile());
      setLang(getLanguage());
      setTheme(getTheme());
      setLargeText(getLargeText());
    });
    return unsubscribe;
  }, []);

  const t = (key, params) => getTranslation(lang, key, params);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ml' : 'en';
    setLang(nextLang);
    saveLanguage(nextLang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  // First launch check
  const isFirstLaunch = !profile || !profile.isSetupCompleted;

  const handleSetupComplete = (newProfile) => {
    setProfile(newProfile);
    setCurrentScreen('dashboard');
  };

  const handleNavigateToDailyEntry = (date = null) => {
    setSelectedEntryDate(date);
    setCurrentScreen('daily_entry');
  };

  const handleNavigateToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleNavigateToFixedCosts = () => {
    setCurrentScreen('fixed_costs');
  };

  const handleNavigateToReports = () => {
    setCurrentScreen('reports');
  };

  const handleResetSetup = () => {
    setCurrentScreen('setup');
  };

  // If first launch or user explicitly requested setup
  if (isFirstLaunch || currentScreen === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
        <SetupScreen 
          onComplete={handleSetupComplete} 
          initialProfile={profile} 
        />
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'daily_entry', label: t('navDailyEntry'), icon: PlusCircle },
    { id: 'fixed_costs', label: t('navFixedCosts'), icon: Building2 },
    { id: 'reports', label: t('navReports'), icon: BarChart3 },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors flex flex-col md:flex-row">
      {/* DESKTOP SIDEBAR (Visible on md: and up screens) */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 sticky top-0 h-screen z-30">
        <div>
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-2xl bg-navy-900 dark:bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              ₹
            </div>
            <div>
              <h1 className="text-lg font-black text-navy-900 dark:text-white leading-none">
                ProfitPulse
              </h1>
              <span className="text-[11px] font-bold text-slate-500 capitalize">
                {profile?.roleTitle || 'Small Business'}
              </span>
            </div>
          </div>

          {/* User Profile Badge */}
          <div className="mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {profile?.roleTitle || 'Business'}
                </div>
                {profile?.isDemo && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                    {t('demoBadge')}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetSetup}
              className="text-[10px] font-bold text-emerald-600 hover:underline"
            >
              {t('edit')}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'daily_entry') handleNavigateToDailyEntry();
                    else setCurrentScreen(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all text-left ${
                    isActive
                      ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Quick Utility Controls (Language & Theme) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center font-medium">
            ProfitPulse v1.0 · Local-First
          </p>
        </div>
      </aside>

      {/* MAIN SCREEN ROUTER */}
      <main className="flex-1 w-full overflow-x-hidden">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            onNavigateToDailyEntry={handleNavigateToDailyEntry}
            onNavigateToFixedCosts={handleNavigateToFixedCosts}
            onNavigateToReports={handleNavigateToReports}
            onResetSetup={handleResetSetup}
          />
        )}

        {currentScreen === 'daily_entry' && (
          <DailyEntryScreen
            onNavigateToDashboard={handleNavigateToDashboard}
            initialDate={selectedEntryDate}
          />
        )}

        {currentScreen === 'fixed_costs' && (
          <FixedCostsScreen />
        )}

        {currentScreen === 'reports' && (
          <ReportsScreen
            onNavigateToDashboard={handleNavigateToDashboard}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            onResetSetup={handleResetSetup}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on mobile screens < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 max-w-2xl mx-auto transition-colors">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'daily_entry') handleNavigateToDailyEntry();
                  else setCurrentScreen(item.id);
                }}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-black'
                    : 'text-slate-400 dark:text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-950/40' : ''
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] leading-none tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

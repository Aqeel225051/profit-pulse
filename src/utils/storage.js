/**
 * src/utils/storage.js
 * Comprehensive localStorage persistence layer for ProfitPulse.
 * All monetary amounts are handled as whole Rupees (integer numbers).
 * Designed for seamless drop-in replacement with Supabase or Cloud API in the future.
 */

import { generateTeaShopDemoData, generateAutoDriverDemoData } from './demoData';

const STORAGE_KEYS = {
  PROFILE: 'profitpulse_profile',
  FIXED_COSTS: 'profitpulse_fixed_costs',
  DAILY_ENTRIES: 'profitpulse_daily_entries',
  SETTINGS: 'profitpulse_settings',
  LANG: 'profitpulse_lang',
  THEME: 'profitpulse_theme',
  LARGE_TEXT: 'profitpulse_large_text',
};

// Preset category buttons and configurations for the 3 main roles
export const ROLE_PRESETS = {
  business: {
    id: 'business',
    title: 'Small Business Owner',
    subTypes: [
      { id: 'tea_shop', label: 'Tea Shop', defaultButtons: ['milk', 'tea_powder', 'sugar', 'gas', 'supplies', 'packaging', 'transport'] },
      { id: 'bakery', label: 'Bakery', defaultButtons: ['flour', 'sugar', 'butter', 'gas', 'packaging', 'staff_wages'] },
      { id: 'grocery', label: 'Grocery Shop', defaultButtons: ['stock_purchase', 'transport', 'packaging', 'electricity', 'helper'] },
      { id: 'juice_shop', label: 'Juice Shop', defaultButtons: ['fruits', 'sugar', 'ice', 'milk', 'cups_straws', 'transport'] },
      { id: 'salon', label: 'Salon / Barber', defaultButtons: ['lotions_cream', 'blades_towels', 'electricity', 'helper'] },
      { id: 'tailoring', label: 'Tailoring Shop', defaultButtons: ['thread_needles', 'cloth_materials', 'electricity', 'machine_oil'] },
      { id: 'other_business', label: 'Other Business', defaultButtons: ['supplies', 'materials', 'transport', 'packaging'] },
    ],
    defaultButtons: ['milk', 'tea_powder', 'sugar', 'gas', 'supplies', 'packaging', 'transport'],
    splitEarnings: true, // Cash + UPI
  },
  driver: {
    id: 'driver',
    title: 'Auto / Taxi / Delivery Driver',
    subTypes: [
      { id: 'auto_driver', label: 'Auto Driver', defaultButtons: ['petrol', 'cng', 'food_tea', 'parking', 'repairs', 'puncture', 'maintenance'] },
      { id: 'taxi_driver', label: 'Taxi / Cab Driver', defaultButtons: ['diesel', 'petrol', 'toll_parking', 'food_tea', 'car_wash', 'maintenance'] },
      { id: 'delivery', label: 'Delivery Partner', defaultButtons: ['petrol', 'food_tea', 'bike_maintenance', 'mobile_data', 'puncture'] },
    ],
    defaultButtons: ['petrol', 'cng', 'diesel', 'food_tea', 'parking', 'repairs', 'puncture', 'maintenance'],
    splitEarnings: true, // Auto & taxi drivers in India frequently receive both Cash & UPI QR
  },
  worker: {
    id: 'worker',
    title: 'Other Daily-Wage Worker',
    subTypes: [
      { id: 'electrician', label: 'Electrician', defaultButtons: ['materials', 'wires_parts', 'tools', 'transport', 'food'] },
      { id: 'plumber', label: 'Plumber', defaultButtons: ['pipes_fittings', 'tools', 'transport', 'food'] },
      { id: 'painter', label: 'Painter', defaultButtons: ['paint_brushes', 'thinner', 'transport', 'food'] },
      { id: 'vendor', label: 'Street Vendor', defaultButtons: ['vegetables_stock', 'transport', 'packaging', 'tea_snacks'] },
      { id: 'farm_labourer', label: 'Farm Worker', defaultButtons: ['transport', 'food', 'tools'] },
      { id: 'other_worker', label: 'Other Worker', defaultButtons: ['materials', 'tools', 'transport', 'food'] },
    ],
    defaultButtons: ['materials', 'tools', 'transport', 'food'],
    splitEarnings: false,
  },
};

/**
 * Format any number as Indian Rupees (₹) with Indian number grouping.
 * e.g., 1780 -> "₹1,780", -320 -> "-₹320"
 */
export function formatRupees(amount) {
  const rounded = Math.round(Number(amount) || 0);
  const formatted = Math.abs(rounded).toLocaleString('en-IN');
  return rounded < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Ensure an amount is a clean non-negative whole rupee integer
 */
export function sanitizeWholeRupees(value) {
  if (value === '' || value === null || value === undefined) return 0;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 0) return 0;
  return num;
}

/**
 * Global Custom Event Dispatcher for instant cross-component updates
 */
const STORAGE_EVENT = 'profitpulse_storage_update';

export function notifyStorageChange(detailKey) {
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key: detailKey } }));
  }
}

export function onStorageChange(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => callback(e.detail);
  window.addEventListener(STORAGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(STORAGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/**
 * PROFILE OPERATIONS
 */
export function getProfile() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading profile:', e);
    return null;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    notifyStorageChange('profile');
    return profile;
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

/**
 * FIXED COSTS OPERATIONS
 */
export const DEFAULT_FIXED_COSTS = {
  workingDays: 25,
  items: [
    { id: 'fc-1', name: 'Rent', monthlyAmount: 6000, frequency: 'monthly', dueDate: 5, active: true },
    { id: 'fc-2', name: 'Electricity', monthlyAmount: 1500, frequency: 'monthly', dueDate: 10, active: true },
    { id: 'fc-3', name: 'Water', monthlyAmount: 500, frequency: 'monthly', dueDate: 15, active: true },
  ],
};

export function getFixedCosts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FIXED_COSTS);
    if (!data) {
      return DEFAULT_FIXED_COSTS;
    }
    const parsed = JSON.parse(data);
    return {
      workingDays: sanitizeWholeRupees(parsed.workingDays) || 25,
      items: Array.isArray(parsed.items) ? parsed.items.map(item => ({
        id: String(item.id || Date.now() + Math.random()),
        name: String(item.name || '').trim(),
        monthlyAmount: sanitizeWholeRupees(item.monthlyAmount),
        frequency: item.frequency || 'monthly',
        dueDate: Math.min(31, Math.max(1, parseInt(item.dueDate, 10) || 5)),
        active: item.active !== false,
      })) : [],
    };
  } catch (e) {
    console.error('Error reading fixed costs:', e);
    return DEFAULT_FIXED_COSTS;
  }
}

export function saveFixedCosts(fixedCosts) {
  try {
    const sanitized = {
      workingDays: sanitizeWholeRupees(fixedCosts.workingDays) || 25,
      items: (fixedCosts.items || []).map(item => ({
        id: String(item.id || Date.now() + Math.random()),
        name: String(item.name || '').trim(),
        monthlyAmount: sanitizeWholeRupees(item.monthlyAmount),
        frequency: item.frequency || 'monthly',
        dueDate: Math.min(31, Math.max(1, parseInt(item.dueDate, 10) || 5)),
        active: item.active !== false,
      })),
    };
    localStorage.setItem(STORAGE_KEYS.FIXED_COSTS, JSON.stringify(sanitized));
    notifyStorageChange('fixedCosts');
    return sanitized;
  } catch (e) {
    console.error('Error saving fixed costs:', e);
  }
}

/**
 * DAILY ENTRIES OPERATIONS
 */
export function getDailyEntries() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_ENTRIES);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading daily entries:', e);
    return {};
  }
}

export function getDailyEntry(dateStr) {
  const entries = getDailyEntries();
  return entries[dateStr] || null;
}

export function saveDailyEntry(entry) {
  try {
    const entries = getDailyEntries();
    const date = entry.date;
    
    const cash = sanitizeWholeRupees(entry.earnings?.cash);
    const upi = sanitizeWholeRupees(entry.earnings?.upi);
    const other = sanitizeWholeRupees(entry.earnings?.other);
    const total = entry.earnings?.isSplit ? (cash + upi + other) : sanitizeWholeRupees(entry.earnings?.total);
    
    const sanitizedExpenses = (entry.expenses || []).map(exp => ({
      id: String(exp.id || Date.now() + Math.random()),
      category: String(exp.category || '').trim(),
      amount: sanitizeWholeRupees(exp.amount),
    }));

    entries[date] = {
      date,
      earnings: {
        isSplit: !!entry.earnings?.isSplit,
        cash,
        upi,
        other,
        total,
      },
      expenses: sanitizedExpenses,
      note: entry.note || '',
      updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.DAILY_ENTRIES, JSON.stringify(entries));
    notifyStorageChange('dailyEntries');
    return entries[date];
  } catch (e) {
    console.error('Error saving daily entry:', e);
  }
}

export function deleteDailyEntry(dateStr) {
  try {
    const entries = getDailyEntries();
    delete entries[dateStr];
    localStorage.setItem(STORAGE_KEYS.DAILY_ENTRIES, JSON.stringify(entries));
    notifyStorageChange('dailyEntries');
  } catch (e) {
    console.error('Error deleting daily entry:', e);
  }
}

/**
 * PROFIT SPLIT & SAVINGS SETTINGS
 * Default: Take-Home 60%, Savings 20%, Upcoming Dues 20%
 */
export function getProfitSplit() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return { takeHome: 60, savings: 20, dues: 20 };
    const parsed = JSON.parse(data);
    if (parsed.profitSplit) return parsed.profitSplit;
    return {
      takeHome: 60,
      savings: parseInt(parsed.savingsPercent, 10) || 20,
      dues: 20,
    };
  } catch (e) {
    return { takeHome: 60, savings: 20, dues: 20 };
  }
}

export function saveProfitSplit(split) {
  try {
    const current = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings = current ? JSON.parse(current) : {};
    settings.profitSplit = {
      takeHome: Math.max(0, Math.min(100, parseInt(split.takeHome, 10) || 60)),
      savings: Math.max(0, Math.min(100, parseInt(split.savings, 10) || 20)),
      dues: Math.max(0, Math.min(100, parseInt(split.dues, 10) || 20)),
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    notifyStorageChange('settings');
    return settings.profitSplit;
  } catch (e) {
    console.error('Error saving profit split:', e);
  }
}

// Backward compatible helper for single savings percent
export function getSavingsPercent() {
  return getProfitSplit().savings;
}

export function saveSavingsPercent(val) {
  const current = getProfitSplit();
  const savings = Math.max(0, Math.min(100, parseInt(val, 10) || 20));
  const remaining = 100 - savings;
  const takeHome = Math.round(remaining * 0.75);
  const dues = remaining - takeHome;
  saveProfitSplit({ takeHome, savings, dues });
  return savings;
}

/**
 * TARGETS OPERATIONS
 */
export function getTargets() {
  try {
    const profile = getProfile();
    return {
      daily: profile?.dailyTarget || 3000,
      monthly: profile?.monthlyTarget || 75000,
    };
  } catch (e) {
    return { daily: 3000, monthly: 75000 };
  }
}

export function saveTargets(daily, monthly) {
  try {
    const profile = getProfile() || {};
    profile.dailyTarget = sanitizeWholeRupees(daily);
    profile.monthlyTarget = sanitizeWholeRupees(monthly);
    saveProfile(profile);
  } catch (e) {
    console.error('Error saving targets:', e);
  }
}

/**
 * LANGUAGE PREFERENCES ('en' or 'ml')
 */
export function getLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANG) || 'en';
  } catch (e) {
    return 'en';
  }
}

export function saveLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    notifyStorageChange('lang');
    return lang;
  } catch (e) {
    console.error('Error saving language:', e);
  }
}

/**
 * THEME & ACCESSIBILITY PREFERENCES
 */
export function getTheme() {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  } catch (e) {
    return 'light';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    notifyStorageChange('theme');
    return theme;
  } catch (e) {
    console.error('Error saving theme:', e);
  }
}

export function getLargeText() {
  try {
    return localStorage.getItem(STORAGE_KEYS.LARGE_TEXT) === 'true';
  } catch (e) {
    return false;
  }
}

export function saveLargeText(enabled) {
  try {
    localStorage.setItem(STORAGE_KEYS.LARGE_TEXT, enabled ? 'true' : 'false');
    if (enabled) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    notifyStorageChange('largeText');
    return enabled;
  } catch (e) {
    console.error('Error saving large text setting:', e);
  }
}

/**
 * DEMO DATA LOADERS
 */
export function loadDemoAccount(type = 'tea_shop') {
  try {
    const data = type === 'auto_driver' 
      ? generateAutoDriverDemoData() 
      : generateTeaShopDemoData();

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    localStorage.setItem(STORAGE_KEYS.FIXED_COSTS, JSON.stringify(data.fixedCosts));
    localStorage.setItem(STORAGE_KEYS.DAILY_ENTRIES, JSON.stringify(data.entries));
    
    notifyStorageChange('all');
    return data;
  } catch (e) {
    console.error('Error loading demo account:', e);
  }
}

export function resetAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.FIXED_COSTS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    notifyStorageChange('all');
  } catch (e) {
    console.error('Error resetting data:', e);
  }
}

/**
 * EXPORT DATA AS JSON
 */
export function exportDataAsJSON() {
  try {
    const exportObj = {
      profile: getProfile(),
      fixedCosts: getFixedCosts(),
      dailyEntries: getDailyEntries(),
      profitSplit: getProfitSplit(),
      language: getLanguage(),
      exportedAt: new Date().toISOString(),
      app: 'ProfitPulse',
    };
    const jsonStr = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profitpulse_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Error exporting data:', e);
  }
}

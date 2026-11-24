/**
 * src/utils/demoData.js
 * Generates 35+ days of realistic historical entries for demonstration accounts.
 * Meets the exact baseline figures specified in Section 15 of user requirements.
 */

// Format date helper: returns YYYY-MM-DD
function getDateStringDaysAgo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateTeaShopDemoData() {
  const entries = {};
  
  // 35 days of history (from 35 days ago up to today = 0 days ago)
  for (let i = 35; i >= 0; i--) {
    const dateStr = getDateStringDaysAgo(i);
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Baseline: Cash ₹2,000, UPI ₹1,200 = ₹3,200
    // Today (i === 0) gets exact baseline
    let cash = 2000;
    let upi = 1200;
    let milk = 400;
    let tea = 150;
    let sugar = 100;
    let gas = 150;
    let supplies = 300;

    if (i > 0) {
      // Variance for realistic history
      // Weekends earn 15-25% more; rainy days or slower mid-week days earn slightly less
      const factor = isWeekend ? (1.15 + (i % 3) * 0.05) : (0.90 + (i % 5) * 0.04);
      cash = Math.round((2000 * factor) / 50) * 50;
      upi = Math.round((1200 * factor) / 50) * 50;
      
      milk = Math.round((400 * factor) / 20) * 20;
      tea = Math.round((150 * (0.9 + (i % 3) * 0.1)) / 10) * 10;
      sugar = Math.round((100 * (0.9 + (i % 2) * 0.15)) / 10) * 10;
      gas = i % 4 === 0 ? 300 : (i % 2 === 0 ? 150 : 100);
      supplies = Math.round((300 * factor) / 20) * 20;
    }

    const dayTotal = cash + upi;
    entries[dateStr] = {
      date: dateStr,
      earnings: {
        cash,
        upi,
        other: 0,
        total: dayTotal,
      },
      expenses: [
        { id: `exp-milk-${dateStr}`, category: 'milk', amount: milk },
        { id: `exp-tea-${dateStr}`, category: 'tea_powder', amount: tea },
        { id: `exp-sugar-${dateStr}`, category: 'sugar', amount: sugar },
        { id: `exp-gas-${dateStr}`, category: 'gas', amount: gas },
        { id: `exp-supplies-${dateStr}`, category: 'supplies', amount: supplies },
      ],
      note: i === 0 ? 'Regular busy day' : undefined,
    };
  }

  const profile = {
    role: 'business',
    roleType: 'tea_shop',
    roleTitle: 'Tea Shop',
    isSetupCompleted: true,
    isDemo: true,
    demoType: 'tea_shop',
    dailyTarget: 3500,
    monthlyTarget: 85000,
    profitSplit: {
      takeHome: 60,
      savings: 20,
      dues: 20,
    },
    expenseButtons: ['milk', 'tea_powder', 'sugar', 'gas', 'supplies', 'packaging', 'transport'],
    updatedAt: Date.now(),
  };

  const fixedCosts = {
    workingDays: 25,
    items: [
      { id: 'fc-1', name: 'Rent', monthlyAmount: 6000, frequency: 'monthly', dueDate: 5, active: true },
      { id: 'fc-2', name: 'Electricity', monthlyAmount: 1500, frequency: 'monthly', dueDate: 10, active: true },
      { id: 'fc-3', name: 'Water', monthlyAmount: 500, frequency: 'monthly', dueDate: 15, active: true },
    ],
  };

  return { profile, fixedCosts, entries };
}

export function generateAutoDriverDemoData() {
  const entries = {};

  // 35 days of history
  for (let i = 35; i >= 0; i--) {
    const dateStr = getDateStringDaysAgo(i);
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Baseline: Cash ₹1,500, UPI ₹500 = ₹2,000
    // Expenses: Petrol ₹400, Food ₹100, Parking ₹30, Maintenance ₹50 = ₹580
    let cash = 1500;
    let upi = 500;
    let petrol = 400;
    let food = 100;
    let parking = 30;
    let maintenance = 50;

    if (i > 0) {
      const factor = isWeekend ? (1.10 + (i % 3) * 0.05) : (0.85 + (i % 4) * 0.06);
      cash = Math.round((1500 * factor) / 50) * 50;
      upi = Math.round((500 * factor) / 50) * 50;
      
      petrol = Math.round((400 * factor) / 20) * 20;
      food = Math.round((100 * (0.9 + (i % 3) * 0.1)) / 10) * 10;
      parking = i % 2 === 0 ? 40 : 20;
      maintenance = i % 7 === 0 ? 250 : (i % 3 === 0 ? 50 : 0);
    }

    const dayTotal = cash + upi;
    const expensesList = [
      { id: `exp-fuel-${dateStr}`, category: 'petrol', amount: petrol },
      { id: `exp-food-${dateStr}`, category: 'food_tea', amount: food },
      { id: `exp-parking-${dateStr}`, category: 'parking', amount: parking },
    ];
    if (maintenance > 0) {
      expensesList.push({ id: `exp-maint-${dateStr}`, category: 'maintenance', amount: maintenance });
    }

    entries[dateStr] = {
      date: dateStr,
      earnings: {
        cash,
        upi,
        other: 0,
        total: dayTotal,
      },
      expenses: expensesList,
      note: i === 0 ? 'City trips & station rides' : undefined,
    };
  }

  const profile = {
    role: 'driver',
    roleType: 'auto_driver',
    roleTitle: 'Auto Driver',
    isSetupCompleted: true,
    isDemo: true,
    demoType: 'auto_driver',
    dailyTarget: 2200,
    monthlyTarget: 55000,
    profitSplit: {
      takeHome: 60,
      savings: 20,
      dues: 20,
    },
    expenseButtons: ['petrol', 'cng', 'diesel', 'food_tea', 'parking', 'repairs', 'puncture', 'maintenance'],
    updatedAt: Date.now(),
  };

  const fixedCosts = {
    workingDays: 25,
    items: [
      { id: 'fc-1', name: 'EMI', monthlyAmount: 4000, frequency: 'monthly', dueDate: 10, active: true },
      { id: 'fc-2', name: 'Insurance', monthlyAmount: 1000, frequency: 'monthly', dueDate: 20, active: true },
      { id: 'fc-3', name: 'Other costs', monthlyAmount: 500, frequency: 'monthly', dueDate: 25, active: true },
    ],
  };

  return { profile, fixedCosts, entries };
}

# ProfitPulse — Know Your Real Profit. Every Day.

ProfitPulse is a modern, responsive, local-first financial management website designed for small business owners (tea shops, bakeries, grocery shops, salons, tailoring shops), auto/taxi/delivery drivers, and daily-wage workers (electricians, plumbers, painters, vendors).

It delivers on a single, vital promise:
> **"Know what you actually earned today in under 10 seconds."**

---

## 🌟 Key Features

### 1. Real Daily Profit Engine
Traditional daily expense tracking gives a false sense of security by only subtracting today's variable costs (e.g. milk, tea powder, petrol). At month end, rent, electricity, and loan EMIs arrive, wiping out savings.
ProfitPulse calculates:
$$\text{Daily Fixed Cost Share} = \frac{\text{Total Monthly Fixed Costs}}{\text{Working Days}}$$
$$\text{Real Daily Profit} = \text{Total Earnings} - \text{Daily Variable Expenses} - \text{Daily Fixed Cost Share}$$

### 2. Sub-10-Second Daily Entry
- **One-tap expense buttons** tailored to your occupation (Tea shop: Milk, Tea powder, Sugar, Gas, Supplies; Auto driver: Petrol, CNG, Diesel, Food, Parking, Repairs).
- **Fast preset keypad** (+₹50, +₹100, +₹200, +₹500).
- Category management: add custom categories, edit, delete, reorder.
- Split earnings (Cash vs. UPI) or single total.
- Date picker to view, edit, or delete past entries.

### 3. Safe-to-Take-Home & 3-Way Profit Splitting
Automatically splits positive daily profit into:
- **Take-Home Cash (60%)**
- **Savings Reserve (20%)**
- **Upcoming Dues Fund (20%)**
*(Percentages are fully customizable in Settings)*.

### 4. Interactive Reports & Charts (Powered by Recharts)
- **Daily Real Profit Trend**: Area chart showing daily profits and losses.
- **Earnings vs. Expenses**: Comparison bar chart.
- **Category Breakdown**: Interactive donut pie chart with percentage shares.
- Filter by Week (7 days), Month (30 days), or All Time.

### 5. Smart Business Insights & Streaks
- Identifies **Best Earning Day** and **Slowest Day** of the week.
- Detects highest expense categories and fuel expense ratios.
- Tracks consecutive daily entry streaks with celebratory badge.

### 6. Full Malayalam (മലയാളം) & English Support
- Seamless one-click language toggle across all screens, buttons, and financial indicators.
- Indian Rupee (`₹`) formatting throughout.

### 7. Dual Demonstration Accounts
- **Tea Shop Demo**: Preloaded with 35+ days of realistic history (₹3,200/day earnings, ₹1,100 variable expenses, ₹6,000 rent + ₹1,500 electricity + ₹500 water = ₹320/day fixed share, ₹1,780 real profit).
- **Auto Driver Demo**: Preloaded with 35+ days of realistic history (₹2,000/day earnings, ₹580 expenses, ₹4,000 EMI + ₹1,000 insurance + ₹500 other = ₹220/day fixed share, ₹1,200 real profit).
- Switch or reset to a clean blank state anytime from Settings.

### 8. Accessibility & Modern Design
- Light mode & Dark mode.
- Large-text accessibility mode for high legibility on 360px+ screens.
- Desktop sidebar navigation + mobile bottom navigation bar.

---

## 🛠️ Technology Stack

- **React 18**
- **Vite 6**
- **Tailwind CSS 3** (with custom navy, emerald profit, red loss palette)
- **Recharts** (data visualization)
- **Lucide React** (icons)
- **localStorage API** (persists all entries, costs, profiles, languages, themes)
- Decoupled calculations (`src/utils/calculations.js`) and storage layer (`src/utils/storage.js`) ready for future Supabase or cloud backend integrations.

---

## 🚀 Running Locally

```bash
# 1. Navigate to the project directory
cd profitpulse

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build

# 4. Run automated test suite
node test_comprehensive.js
```

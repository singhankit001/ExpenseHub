# Savings Intelligence

> **ExpenseFlow** — Financial intelligence engine documentation  
> Covers: Financial Health Score, Spending Analysis, Budget Tracking, and Recommendation Logic

---

## Overview

The Savings Intelligence layer is the analytical brain of ExpenseFlow. It transforms raw expense records into actionable financial insights by:

1. **Scoring** your financial health on a 0–100 scale
2. **Detecting** spending patterns and behavioral trends
3. **Identifying** budget leaks and overspending
4. **Recommending** optimizations based on your category mix
5. **Forecasting** end-of-month spend based on current trajectory

---

## Financial Health Score

### What It Measures

The Financial Health Score is a composite metric (0–100) that evaluates four dimensions of financial behavior:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Savings Rate | 40% | What % of income you are saving vs spending |
| Budget Adherence | 30% | How closely you stick to your set budgets |
| Spending Consistency | 20% | How predictable your spending is month-over-month |
| Category Diversification | 10% | Whether spending is balanced across categories |

### Score Tiers

| Score | Tier | Label | Meaning |
|-------|------|-------|---------|
| 85–100 | 🟢 | Excellent | Exceptional financial discipline |
| 70–84 | 🔵 | Good | Healthy financial habits |
| 55–69 | 🟡 | Fair | Some improvement areas |
| 40–54 | 🟠 | Needs Work | Significant overspending patterns |
| 0–39 | 🔴 | Critical | Immediate attention required |

### Score Calculation

```
HealthScore = (
  (savingsRateScore × 0.40) +
  (budgetAdherenceScore × 0.30) +
  (consistencyScore × 0.20) +
  (diversificationScore × 0.10)
) × 100

Where each component is normalized to [0, 1]:

savingsRateScore    = clamp(monthlyIncome - totalSpend) / monthlyIncome, 0, 1)
budgetAdherenceScore = 1 - (overBudgetCategories / totalBudgetedCategories)
consistencyScore    = 1 - (stdDev(monthlySpend, last3months) / avgMonthlySpend)
diversificationScore = 1 - (topCategorySpend / totalSpend)
```

### Frontend Component

The `<HealthScore>` component in `src/components/dashboard/HealthScore.tsx` renders:

- An animated SVG arc from 0° to the score percentage
- Color interpolation across red → amber → blue → green
- The tier label with appropriate badge color
- Month-over-month delta indicator

```tsx
import { HealthScore } from '@/components/dashboard/HealthScore';

<HealthScore
  score={72}           // 0–100
  previousScore={68}   // last month's score for delta
  tier="Good"
/>
```

---

## Spending Analysis

### Category Breakdown

Expenses are grouped by category to show proportional spend:

```
Category Breakdown Calculation:
─────────────────────────────────
For each Category C:
  categoryTotal(C) = SUM(expense.amount WHERE category = C AND month = current)
  categoryPercent(C) = categoryTotal(C) / totalMonthlySpend × 100

Sorted descending by categoryTotal.
```

This powers the progress bar visualization on the Dashboard and the category pie chart on Reports.

### Daily Average

```
dailyAverage = totalMonthlySpend / daysElapsedInCurrentMonth
```

This is recalculated on every request for real-time accuracy.

### Monthly Trend

The sparkline charts track the last 6 months of total spend per month, allowing users to spot seasonal patterns and growth trends.

```
For month M in [currentMonth - 5 ... currentMonth]:
  monthlyTotal(M) = SUM(expense.amount WHERE expenseDate IN M)
```

---

## Budget Adherence Engine

### Budget Model (Planned)

Each budget is a per-category monthly limit:

```
Budget {
  id         UUID
  userId     FK → User
  category   Category enum
  limitAmount Decimal(10,2)
  month      Int (1–12)
  year       Int
}
```

### Adherence Score Calculation

```
For each budgeted category C:
  spent(C)    = SUM(expenses for C in current month)
  limit(C)    = budget.limitAmount for C
  ratio(C)    = spent(C) / limit(C)

  status:
    ratio < 0.70  → "On Track" (green)
    ratio < 0.90  → "Caution"  (amber)
    ratio < 1.00  → "Warning"  (orange)
    ratio >= 1.00 → "Exceeded" (red)

budgetAdherenceScore = count(categories where ratio < 1) / count(budgeted categories)
```

---

## Subscription & Recurring Detection

### Detection Algorithm

A recurring expense is detected when:

1. An expense with identical or near-identical title appears in **3+ consecutive months**
2. The amounts are within **±10%** of each other (accounting for minor billing fluctuations)
3. The day of month is consistent (within ±3 days)

```
isRecurring(expense) = (
  matchingExpenses.count >= 3 AND
  stdDev(matchingExpenses.amounts) / avg(matchingExpenses.amounts) < 0.10 AND
  stdDev(matchingExpenses.dayOfMonth) < 3
)
```

### Why This Matters

Identifying recurring charges helps users:
- Spot subscriptions they forgot they were paying
- Detect unauthorized recurring charges
- Understand their fixed vs. variable cost split

---

## Spending Forecasting

### End-of-Month Projection

```
remainingDays = daysInMonth - today
projectedTotal = spentSoFar + (dailyAverage × remainingDays)

forecastVariance = projectedTotal - lastMonthTotal
```

This is displayed as:
- "On track to spend ₹X this month" (if projectedTotal ≈ lastMonthTotal)
- "⚠️ Projected to overspend by ₹X" (if projectedTotal > lastMonthTotal × 1.10)

---

## Insight Recommendations

### Rule Engine

The recommendation engine applies deterministic rules against the user's spending data:

| Rule ID | Trigger Condition | Recommendation |
|---------|------------------|----------------|
| `R001` | Food > 40% of total spend | "Consider meal prepping — Food is your biggest expense category" |
| `R002` | Entertainment > 20% of total | "Your entertainment spend is above average — review streaming subscriptions" |
| `R003` | 3+ recurring charges detected | "You have {N} recurring subscriptions. Review and cancel unused ones" |
| `R004` | Monthly spend increasing 3 months in a row | "Your spending has increased 3 months straight — set a budget to course-correct" |
| `R005` | Health category spend = 0 | "You haven't logged health expenses — remember to prioritize preventive healthcare" |
| `R006` | Budget exceeded in 2+ categories | "You exceeded budget in {N} categories. Consider adjusting limits or reducing discretionary spend" |
| `R007` | No expenses logged in 7+ days | "You haven't logged any expenses this week — keep your records up to date for accurate insights" |

### AI Insights (Roadmap — v1.1)

In v1.1, the rule engine will be augmented by a **Gemini API integration** that:

1. Takes the last 90 days of categorized spending data as context
2. Generates natural language personalized recommendations
3. Identifies anomalous single transactions ("This ₹8,500 charge at Electronics is 3× your typical shopping transaction")
4. Suggests savings goals based on current trajectory

---

## Emergency Fund Planner (Roadmap — v1.2)

### Calculation

```
monthlyEssentials = SUM(Food + Bills + Health + Housing expenses, last 3 month avg)
recommendedEmergencyFund = monthlyEssentials × 6

currentEmergencyFund = user-inputted savings balance
fundingGap = recommendedEmergencyFund - currentEmergencyFund
monthsToFund(savingsRate) = fundingGap / (monthlyIncome × savingsRate)
```

### Displayed As

A visual tracker showing:
- Current vs. recommended emergency fund
- Monthly contribution required to reach target in 6 months
- Progress percentage with milestone markers at 1M, 3M, 6M coverage

---

## Goal Tracking (Roadmap — v1.2)

Users can define savings goals:

```
Goal {
  id           UUID
  userId       FK → User
  title        String
  targetAmount Decimal(10,2)
  currentAmount Decimal(10,2)
  deadline     DateTime
  category     String?    // e.g. "Vacation", "Emergency Fund", "New Laptop"
}
```

The progress widget shows:
- Percentage complete
- Daily saving required to hit deadline
- Whether the goal is on-track given current saving rate

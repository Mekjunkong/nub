import type {
  DebtPayoffInputs,
  DebtPayoffResults,
  StrategyResult,
  DebtScheduleEntry,
  DebtItem,
} from "@/types/calculator";

const MAX_MONTHS = 360;

type SortFn = (a: DebtItem, b: DebtItem) => number;

function simulateStrategy(
  debts: DebtItem[],
  extraPayment: number,
  sortFn: SortFn
): StrategyResult {
  // Deep-copy balances so we don't mutate
  const balances = debts.map((d) => d.balance);
  const rates = debts.map((d) => d.interestRate / 100 / 12); // monthly rate
  const mins = debts.map((d) => d.minPayment);
  const names = debts.map((d) => d.name);

  // Build sorted index order
  const sorted = debts
    .map((d, i) => ({ ...d, originalIndex: i }))
    .sort(sortFn)
    .map((d) => d.originalIndex);

  let totalInterest = 0;
  const schedule: DebtScheduleEntry[] = [];
  let month = 0;

  while (month < MAX_MONTHS) {
    // Check if all paid off
    const totalBalance = balances.reduce((s, b) => s + b, 0);
    if (totalBalance <= 0.01) break;

    // Record snapshot at start of month
    schedule.push({
      month,
      debts: names.map((name, i) => ({ name, balance: Math.max(0, balances[i]) })),
      totalBalance: Math.max(0, totalBalance),
    });

    month++;

    // 1. Accrue interest
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] > 0) {
        const interest = balances[i] * rates[i];
        balances[i] += interest;
        totalInterest += interest;
      }
    }

    // 2. Pay minimums
    let remaining = extraPayment;
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] > 0) {
        const payment = Math.min(mins[i], balances[i]);
        balances[i] -= payment;
      }
    }

    // 3. Apply extra payment in priority order
    for (const idx of sorted) {
      if (remaining <= 0) break;
      if (balances[idx] > 0) {
        const payment = Math.min(remaining, balances[idx]);
        balances[idx] -= payment;
        remaining -= payment;
      }
    }
  }

  // Final snapshot
  const finalTotal = balances.reduce((s, b) => s + b, 0);
  if (finalTotal <= 0.01 && (schedule.length === 0 || schedule[schedule.length - 1].month !== month)) {
    schedule.push({
      month,
      debts: names.map((name, i) => ({ name, balance: Math.max(0, balances[i]) })),
      totalBalance: 0,
    });
  }

  return {
    totalInterest: Math.round(totalInterest * 100) / 100,
    payoffMonths: month,
    schedule,
  };
}

export function calculateDebtPayoff(inputs: DebtPayoffInputs): DebtPayoffResults {
  const { debts, extraMonthlyPayment } = inputs;

  // Snowball: smallest balance first
  const snowball = simulateStrategy(debts, extraMonthlyPayment, (a, b) => a.balance - b.balance);

  // Avalanche: highest interest rate first
  const avalanche = simulateStrategy(debts, extraMonthlyPayment, (a, b) => b.interestRate - a.interestRate);

  const interestSaved = snowball.totalInterest - avalanche.totalInterest;

  return {
    snowball,
    avalanche,
    interestSaved: Math.round(interestSaved * 100) / 100,
    recommendedStrategy: interestSaved > 0 ? "avalanche" : "snowball",
  };
}

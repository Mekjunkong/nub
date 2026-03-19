/**
 * Cashflow Math Library
 * Pure functions for income/expense tracking and financial health ratio calculations.
 */

export interface CashflowTransactionInput {
  direction: "income" | "expense" | "saving" | "investment";
  category: string;
  amount: number;
}

export interface CashflowResults {
  totalIncome: number;
  totalExpenses: number;
  totalSavingsInvestment: number;
  totalOutflow: number;
  netCashflow: number;
  savingsInvestmentRatio: number;
  insuranceRiskRatio: number;
  debtServiceRatio: number;
  taxDeductibleTotal: number;
  lifestyleBreakdown: {
    personal: number;
    family: number;
    transport: number;
    education: number;
    travel: number;
    housing: number;
    other: number;
  };
}

const TAX_DEDUCTIBLE_CATEGORIES = new Set([
  "rmf", "ssf", "pvd", "gpf", "tesg",
  "insurance_life", "insurance_health", "insurance_pension",
]);

const INSURANCE_CATEGORIES = new Set([
  "insurance_life", "insurance_health", "insurance_pension",
]);

const LIFESTYLE_KEYS = new Set([
  "personal", "family", "transport", "education", "travel", "housing",
]);

/**
 * Calculate financial health ratios from a list of cashflow transactions.
 */
export function calculateCashflowResults(
  transactions: CashflowTransactionInput[]
): CashflowResults {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSavingsInvestment = 0;
  let debtTotal = 0;
  let insuranceTotal = 0;
  let taxDeductibleTotal = 0;

  const lifestyle = {
    personal: 0,
    family: 0,
    transport: 0,
    education: 0,
    travel: 0,
    housing: 0,
    other: 0,
  };

  for (const tx of transactions) {
    if (tx.direction === "income") {
      totalIncome += tx.amount;
    } else if (tx.direction === "expense") {
      totalExpenses += tx.amount;
      if (tx.category === "debt") {
        debtTotal += tx.amount;
      } else if (LIFESTYLE_KEYS.has(tx.category)) {
        lifestyle[tx.category as keyof typeof lifestyle] += tx.amount;
      } else if (tx.category !== "donation") {
        lifestyle.other += tx.amount;
      }
    } else {
      totalSavingsInvestment += tx.amount;
    }

    if (TAX_DEDUCTIBLE_CATEGORIES.has(tx.category)) {
      taxDeductibleTotal += tx.amount;
    }
    if (INSURANCE_CATEGORIES.has(tx.category)) {
      insuranceTotal += tx.amount;
    }
  }

  const totalOutflow = totalExpenses + totalSavingsInvestment;
  const netCashflow = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    totalSavingsInvestment,
    totalOutflow,
    netCashflow,
    savingsInvestmentRatio: totalIncome > 0 ? totalSavingsInvestment / totalIncome : 0,
    insuranceRiskRatio: totalIncome > 0 ? insuranceTotal / totalIncome : 0,
    debtServiceRatio: totalIncome > 0 ? debtTotal / totalIncome : 0,
    taxDeductibleTotal,
    lifestyleBreakdown: lifestyle,
  };
}

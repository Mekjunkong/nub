import { describe, it, expect } from "vitest";
import {
  calculateCashflowResults,
  type CashflowTransactionInput,
} from "@/lib/cashflow-math";

const sampleTransactions: CashflowTransactionInput[] = [
  { direction: "income", category: "salary", amount: 40000 },
  { direction: "income", category: "overtime", amount: 5000 },
  { direction: "expense", category: "personal", amount: 8000 },
  { direction: "expense", category: "family", amount: 12000 },
  { direction: "expense", category: "transport", amount: 3000 },
  { direction: "expense", category: "debt", amount: 5000 },
  { direction: "saving", category: "rmf", amount: 5000 },
  { direction: "investment", category: "ssf", amount: 3000 },
  { direction: "saving", category: "insurance_life", amount: 2000 },
];

describe("calculateCashflowResults", () => {
  it("calculates total income correctly", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.totalIncome).toBe(45000);
  });

  it("calculates total expenses correctly (not savings/investments)", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.totalExpenses).toBe(28000);
  });

  it("calculates net cashflow as income minus expenses only", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.netCashflow).toBe(17000);
  });

  it("calculates savings/investment ratio", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.savingsInvestmentRatio).toBeCloseTo(0.2222, 3);
  });

  it("calculates debt service ratio", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.debtServiceRatio).toBeCloseTo(0.1111, 3);
  });

  it("calculates insurance/risk ratio", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.insuranceRiskRatio).toBeCloseTo(0.0444, 3);
  });

  it("calculates tax-deductible total including TESG", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.taxDeductibleTotal).toBe(10000);
  });

  it("builds lifestyle breakdown by category", () => {
    const result = calculateCashflowResults(sampleTransactions);
    expect(result.lifestyleBreakdown.personal).toBe(8000);
    expect(result.lifestyleBreakdown.family).toBe(12000);
    expect(result.lifestyleBreakdown.transport).toBe(3000);
    expect(result.lifestyleBreakdown.education).toBe(0);
  });

  it("handles empty transaction list", () => {
    const result = calculateCashflowResults([]);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.netCashflow).toBe(0);
    expect(result.savingsInvestmentRatio).toBe(0);
    expect(result.debtServiceRatio).toBe(0);
  });
});

import { describe, it, expect } from "vitest";
import { calculateTax, optimizeTax } from "../tax-optimizer.worker";
import type { TaxInputs } from "@/types/calculator";

describe("calculateTax (Thai progressive tax brackets)", () => {
  it("calculates tax for 500K income with no deductions", () => {
    // Thai tax brackets (2024):
    // 0-150K: 0%, 150-300K: 5%, 300-500K: 10%, 500-750K: 15%, etc.
    // Personal allowance: 60K, Expense deduction: 50% (max 100K)
    // Taxable = 500K - 60K - 100K = 340K
    // Tax = 0 + (150K * 5%) + (40K * 10%) = 7500 + 4000 = 11500
    const inputs: TaxInputs = {
      annualIncome: 500000,
      ssfAmount: 0,
      rmfAmount: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      pensionInsurance: 0,
      pvdContribution: 0,
      socialSecurityContribution: 0,
    };
    const result = calculateTax(inputs);
    expect(result.currentTax).toBe(11500);
  });

  it("calculates tax for 1M income with no deductions", () => {
    // Taxable = 1M - 60K - 100K = 840K
    // Tax = 0 + (150K * 5%) + (200K * 10%) + (250K * 15%) + (90K * 20%)
    // = 7500 + 20000 + 37500 + 18000 = 83000
    const inputs: TaxInputs = {
      annualIncome: 1000000,
      ssfAmount: 0,
      rmfAmount: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      pensionInsurance: 0,
      pvdContribution: 0,
      socialSecurityContribution: 0,
    };
    const result = calculateTax(inputs);
    expect(result.currentTax).toBe(83000);
  });

  it("SSF reduces taxable income", () => {
    const withoutSsf: TaxInputs = {
      annualIncome: 1000000,
      ssfAmount: 0,
      rmfAmount: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      pensionInsurance: 0,
      pvdContribution: 0,
      socialSecurityContribution: 0,
    };
    const withSsf: TaxInputs = {
      ...withoutSsf,
      ssfAmount: 200000, // max SSF deduction
    };
    const resultWithout = calculateTax(withoutSsf);
    const resultWith = calculateTax(withSsf);
    expect(resultWith.currentTax).toBeLessThan(resultWithout.currentTax);
  });

  it("RMF reduces taxable income", () => {
    const withoutRmf: TaxInputs = {
      annualIncome: 1000000,
      ssfAmount: 0,
      rmfAmount: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      pensionInsurance: 0,
      pvdContribution: 0,
      socialSecurityContribution: 0,
    };
    const withRmf: TaxInputs = {
      ...withoutRmf,
      rmfAmount: 300000,
    };
    const resultWithout = calculateTax(withoutRmf);
    const resultWith = calculateTax(withRmf);
    expect(resultWith.currentTax).toBeLessThan(resultWithout.currentTax);
  });

  it("effective tax rate is correct", () => {
    const inputs: TaxInputs = {
      annualIncome: 500000,
      ssfAmount: 0,
      rmfAmount: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      pensionInsurance: 0,
      pvdContribution: 0,
      socialSecurityContribution: 0,
    };
    const result = calculateTax(inputs);
    expect(result.effectiveTaxRate).toBeCloseTo(
      result.currentTax / 500000,
      4
    );
  });
});

describe("optimizeTax", () => {
  it("produces recommendations that reduce tax", () => {
    const inputs: TaxInputs = {
      annualIncome: 1000000,
      ssfAmount: 0,
      rmfAmount: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      pensionInsurance: 0,
      pvdContribution: 0,
      socialSecurityContribution: 9000,
    };
    const result = optimizeTax(inputs);
    expect(result.taxSaved).toBeGreaterThan(0);
    expect(result.optimizedTax).toBeLessThan(result.currentTax);
  });

  it("recommendations include SSF for income below 2M", () => {
    const inputs: TaxInputs = {
      annualIncome: 800000,
      ssfAmount: 0,
      rmfAmount: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      pensionInsurance: 0,
      pvdContribution: 0,
      socialSecurityContribution: 9000,
    };
    const result = optimizeTax(inputs);
    const ssfRec = result.recommendations.find(
      (r) => r.instrument === "SSF"
    );
    expect(ssfRec).toBeDefined();
    expect(ssfRec!.recommendedAmount).toBeGreaterThan(0);
  });

  it("respects SSF max (30% of income, max 200K)", () => {
    const inputs: TaxInputs = {
      annualIncome: 500000,
      ssfAmount: 0,
      rmfAmount: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      pensionInsurance: 0,
      pvdContribution: 0,
      socialSecurityContribution: 9000,
    };
    const result = optimizeTax(inputs);
    const ssfRec = result.recommendations.find(
      (r) => r.instrument === "SSF"
    );
    if (ssfRec) {
      // Max is min(30% * 500K, 200K) = min(150K, 200K) = 150K
      expect(ssfRec.maxAllowed).toBe(150000);
    }
  });

  it("returns bracket breakdown", () => {
    const inputs: TaxInputs = {
      annualIncome: 1000000,
      ssfAmount: 0,
      rmfAmount: 0,
      lifeInsurance: 0,
      healthInsurance: 0,
      pensionInsurance: 0,
      pvdContribution: 0,
      socialSecurityContribution: 0,
    };
    const result = optimizeTax(inputs);
    expect(result.brackets.length).toBeGreaterThan(0);
  });
});

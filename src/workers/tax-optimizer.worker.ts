import type {
  TaxInputs,
  TaxResults,
  TaxBracketResult,
  TaxRecommendation,
} from "@/types/calculator";

// Thai progressive tax brackets (2024/2567)
const TAX_BRACKETS = [
  { min: 0, max: 150000, rate: 0 },
  { min: 150000, max: 300000, rate: 0.05 },
  { min: 300000, max: 500000, rate: 0.10 },
  { min: 500000, max: 750000, rate: 0.15 },
  { min: 750000, max: 1000000, rate: 0.20 },
  { min: 1000000, max: 2000000, rate: 0.25 },
  { min: 2000000, max: 5000000, rate: 0.30 },
  { min: 5000000, max: Infinity, rate: 0.35 },
];

// Standard deductions
const PERSONAL_ALLOWANCE = 60000;
const EXPENSE_DEDUCTION_RATE = 0.5;
const MAX_EXPENSE_DEDUCTION = 100000;
const MAX_SSF = 200000;
const MAX_RMF = 500000;
const MAX_LIFE_INSURANCE = 100000;
const MAX_HEALTH_INSURANCE = 25000;
const MAX_PENSION_INSURANCE = 200000;
// Combined SSF + RMF + PVD + Pension Insurance cap
const MAX_RETIREMENT_COMBINED = 500000;
const MAX_SOCIAL_SECURITY = 9000;

/**
 * Calculate tax for given taxable income using Thai brackets.
 */
function computeTaxFromTaxable(taxableIncome: number): {
  tax: number;
  brackets: TaxBracketResult[];
} {
  let remaining = Math.max(0, taxableIncome);
  let totalTax = 0;
  const brackets: TaxBracketResult[] = [];

  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;

    const bracketWidth = bracket.max === Infinity
      ? remaining
      : bracket.max - bracket.min;
    const taxableInBracket = Math.min(remaining, bracketWidth);
    const tax = taxableInBracket * bracket.rate;

    totalTax += tax;
    remaining -= taxableInBracket;

    if (taxableInBracket > 0) {
      brackets.push({
        bracket: bracket.max === Infinity
          ? `${(bracket.min / 1000).toFixed(0)}K+`
          : `${(bracket.min / 1000).toFixed(0)}K-${(bracket.max / 1000).toFixed(0)}K`,
        rate: bracket.rate,
        taxableIncome: taxableInBracket,
        tax,
      });
    }
  }

  return { tax: totalTax, brackets };
}

/**
 * Calculate total deductions from inputs.
 */
function computeDeductions(inputs: TaxInputs): number {
  // Expense deduction
  const expenseDeduction = Math.min(
    inputs.annualIncome * EXPENSE_DEDUCTION_RATE,
    MAX_EXPENSE_DEDUCTION
  );

  // Personal allowance
  const personalAllowance = inputs.personalAllowance ?? PERSONAL_ALLOWANCE;

  // Spouse
  const spouseAllowance = inputs.spouseAllowance ?? 0;

  // Children
  const childAllowance = inputs.childAllowance ?? 0;

  // Parents
  const parentAllowance = inputs.parentAllowance ?? 0;

  // Social security (max 9000)
  const socialSecurity = Math.min(
    inputs.socialSecurityContribution,
    MAX_SOCIAL_SECURITY
  );

  // Life insurance (max 100K)
  const lifeInsurance = Math.min(inputs.lifeInsurance, MAX_LIFE_INSURANCE);

  // Health insurance (max 25K)
  const healthInsurance = Math.min(
    inputs.healthInsurance,
    MAX_HEALTH_INSURANCE
  );

  // Pension insurance (max 200K)
  const pensionInsurance = Math.min(
    inputs.pensionInsurance,
    MAX_PENSION_INSURANCE
  );

  // SSF (max 30% of income, max 200K)
  const ssfMax = Math.min(inputs.annualIncome * 0.3, MAX_SSF);
  const ssf = Math.min(inputs.ssfAmount, ssfMax);

  // RMF (max 30% of income, max 500K)
  const rmfMax = Math.min(inputs.annualIncome * 0.3, MAX_RMF);
  const rmf = Math.min(inputs.rmfAmount, rmfMax);

  // PVD
  const pvd = inputs.pvdContribution;

  // Combined retirement cap: SSF + RMF + PVD + Pension Insurance <= 500K
  const retirementTotal = ssf + rmf + pvd + pensionInsurance;
  const retirementDeduction = Math.min(retirementTotal, MAX_RETIREMENT_COMBINED);
  const retirementExcess = retirementTotal - retirementDeduction;
  const adjustedRetirement = retirementTotal - retirementExcess;

  // Housing loan interest
  const housingLoan = inputs.housingLoanInterest ?? 0;

  // Donations
  const donation = inputs.donationAmount ?? 0;

  return (
    expenseDeduction +
    personalAllowance +
    spouseAllowance +
    childAllowance +
    parentAllowance +
    socialSecurity +
    lifeInsurance +
    healthInsurance +
    adjustedRetirement +
    housingLoan +
    donation
  );
}

/**
 * Calculate tax for the given inputs.
 */
export function calculateTax(
  inputs: TaxInputs
): { currentTax: number; effectiveTaxRate: number; brackets: TaxBracketResult[]; totalDeductions: number } {
  const totalDeductions = computeDeductions(inputs);
  const taxableIncome = Math.max(0, inputs.annualIncome - totalDeductions);
  const { tax, brackets } = computeTaxFromTaxable(taxableIncome);

  return {
    currentTax: tax,
    effectiveTaxRate: inputs.annualIncome > 0 ? tax / inputs.annualIncome : 0,
    brackets,
    totalDeductions,
  };
}

/**
 * Optimize tax deductions and produce recommendations.
 */
export function optimizeTax(inputs: TaxInputs): TaxResults {
  // Current tax
  const current = calculateTax(inputs);

  // Calculate max allowed for each instrument
  const ssfMax = Math.min(inputs.annualIncome * 0.3, MAX_SSF);
  const rmfMax = Math.min(inputs.annualIncome * 0.3, MAX_RMF);

  // Current retirement deductions
  const currentRetirementTotal =
    inputs.ssfAmount +
    inputs.rmfAmount +
    inputs.pvdContribution +
    inputs.pensionInsurance;

  const retirementRoom = Math.max(
    0,
    MAX_RETIREMENT_COMBINED - currentRetirementTotal
  );

  // Build recommendations
  const recommendations: TaxRecommendation[] = [];

  // SSF recommendation
  const ssfRoom = Math.min(ssfMax - inputs.ssfAmount, retirementRoom);
  if (ssfRoom > 0) {
    const testInputs = { ...inputs, ssfAmount: inputs.ssfAmount + ssfRoom };
    const testResult = calculateTax(testInputs);
    recommendations.push({
      instrument: "SSF",
      currentAmount: inputs.ssfAmount,
      recommendedAmount: inputs.ssfAmount + ssfRoom,
      maxAllowed: ssfMax,
      additionalTaxSaved: current.currentTax - testResult.currentTax,
    });
  }

  // RMF recommendation
  const remainingRetirementRoom = Math.max(0, retirementRoom - ssfRoom);
  const rmfRoom = Math.min(
    rmfMax - inputs.rmfAmount,
    remainingRetirementRoom
  );
  if (rmfRoom > 0) {
    const testInputs = { ...inputs, rmfAmount: inputs.rmfAmount + rmfRoom };
    const testResult = calculateTax(testInputs);
    recommendations.push({
      instrument: "RMF",
      currentAmount: inputs.rmfAmount,
      recommendedAmount: inputs.rmfAmount + rmfRoom,
      maxAllowed: rmfMax,
      additionalTaxSaved: current.currentTax - testResult.currentTax,
    });
  }

  // Life insurance recommendation
  const lifeInsuranceRoom = MAX_LIFE_INSURANCE - inputs.lifeInsurance;
  if (lifeInsuranceRoom > 0) {
    const testInputs = {
      ...inputs,
      lifeInsurance: inputs.lifeInsurance + lifeInsuranceRoom,
    };
    const testResult = calculateTax(testInputs);
    recommendations.push({
      instrument: "Life Insurance",
      currentAmount: inputs.lifeInsurance,
      recommendedAmount: MAX_LIFE_INSURANCE,
      maxAllowed: MAX_LIFE_INSURANCE,
      additionalTaxSaved: current.currentTax - testResult.currentTax,
    });
  }

  // Health insurance recommendation
  const healthRoom = MAX_HEALTH_INSURANCE - inputs.healthInsurance;
  if (healthRoom > 0) {
    const testInputs = {
      ...inputs,
      healthInsurance: inputs.healthInsurance + healthRoom,
    };
    const testResult = calculateTax(testInputs);
    recommendations.push({
      instrument: "Health Insurance",
      currentAmount: inputs.healthInsurance,
      recommendedAmount: MAX_HEALTH_INSURANCE,
      maxAllowed: MAX_HEALTH_INSURANCE,
      additionalTaxSaved: current.currentTax - testResult.currentTax,
    });
  }

  // Sort by tax saved (highest first)
  recommendations.sort(
    (a, b) => b.additionalTaxSaved - a.additionalTaxSaved
  );

  // Calculate optimized tax (with all recommendations applied)
  const optimizedInputs: TaxInputs = {
    ...inputs,
    ssfAmount: recommendations.find((r) => r.instrument === "SSF")
      ?.recommendedAmount ?? inputs.ssfAmount,
    rmfAmount: recommendations.find((r) => r.instrument === "RMF")
      ?.recommendedAmount ?? inputs.rmfAmount,
    lifeInsurance: recommendations.find(
      (r) => r.instrument === "Life Insurance"
    )?.recommendedAmount ?? inputs.lifeInsurance,
    healthInsurance: recommendations.find(
      (r) => r.instrument === "Health Insurance"
    )?.recommendedAmount ?? inputs.healthInsurance,
  };

  const optimized = calculateTax(optimizedInputs);

  return {
    currentTax: current.currentTax,
    optimizedTax: optimized.currentTax,
    taxSaved: current.currentTax - optimized.currentTax,
    effectiveTaxRate: current.effectiveTaxRate,
    optimizedEffectiveTaxRate: optimized.effectiveTaxRate,
    brackets: current.brackets,
    recommendations,
    totalDeductions: current.totalDeductions,
  };
}

// Web Worker message handler
if (
  typeof self !== "undefined" &&
  typeof (self as any).onmessage !== "undefined"
) {
  self.onmessage = (e: MessageEvent<TaxInputs>) => {
    const results = optimizeTax(e.data);
    self.postMessage(results);
  };
}

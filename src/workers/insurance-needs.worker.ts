import type {
  InsuranceNeedsInputs,
  InsuranceNeedsResults,
} from "@/types/calculator";

/**
 * Calculate insurance coverage needs and gap analysis.
 * Pure synchronous function — not a real Web Worker.
 */
export function calculateInsuranceNeeds(
  inputs: InsuranceNeedsInputs
): InsuranceNeedsResults {
  const {
    annualIncome,
    yearsOfIncomeReplacement,
    totalDebts,
    existingCoverage,
    finalExpenses,
    dependents,
    educationFundNeeded,
  } = inputs;

  const incomeReplacement = annualIncome * yearsOfIncomeReplacement;
  const debtCoverage = totalDebts;
  const educationFund = educationFundNeeded;

  // Dependents cost: annual cost * years until age 18 (min 0)
  const dependentsCost = dependents.reduce((sum, dep) => {
    const yearsRemaining = Math.max(0, 18 - dep.age);
    return sum + dep.annualCost * yearsRemaining;
  }, 0);

  const totalNeeds =
    incomeReplacement +
    debtCoverage +
    educationFund +
    finalExpenses +
    dependentsCost;

  const gap = totalNeeds - existingCoverage;

  const breakdown: Array<{ category: string; amount: number }> = [
    { category: "Income Replacement", amount: incomeReplacement },
    { category: "Debt Coverage", amount: debtCoverage },
    { category: "Education Fund", amount: educationFund },
    { category: "Final Expenses", amount: finalExpenses },
    { category: "Dependents", amount: dependentsCost },
  ];

  return {
    incomeReplacement,
    debtCoverage,
    educationFund,
    finalExpenses,
    totalNeeds,
    existingCoverage,
    gap,
    breakdown,
  };
}

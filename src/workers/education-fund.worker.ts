import type {
  EducationFundInputs,
  EducationFundResults,
  ChildResult,
} from "@/types/calculator";

const BASE_ANNUAL_COST: Record<string, number> = {
  public: 50000,
  private: 150000,
  international: 400000,
};

/**
 * PMT for future value: monthly payment needed to reach FV
 * Formula: FV * r / ((1+r)^n - 1)
 */
function pmtForFV(monthlyRate: number, months: number, fv: number): number {
  if (monthlyRate === 0) return fv / months;
  const factor = Math.pow(1 + monthlyRate, months) - 1;
  return (fv * monthlyRate) / factor;
}

export function calculateEducationFund(
  inputs: EducationFundInputs
): EducationFundResults {
  const {
    children,
    universityTier,
    yearsOfStudy,
    educationInflation,
    currentSavings,
    expectedReturn,
  } = inputs;

  const baseCost = BASE_ANNUAL_COST[universityTier] ?? 50000;
  const monthlyRate = expectedReturn / 12;

  const childResults: ChildResult[] = children.map((child) => {
    const yearsUntilEnrollment = Math.max(child.enrollmentAge - child.currentAge, 0);
    const inflatedAnnualCost =
      baseCost * Math.pow(1 + educationInflation, yearsUntilEnrollment);
    const futureTotalCost = inflatedAnnualCost * yearsOfStudy;

    const months = yearsUntilEnrollment * 12;
    const requiredMonthlySavings =
      months > 0 ? pmtForFV(monthlyRate, months, futureTotalCost) : futureTotalCost;

    return {
      name: child.name,
      futureTotalCost,
      requiredMonthlySavings,
      yearsUntilEnrollment,
    };
  });

  const totalFutureCost = childResults.reduce((s, c) => s + c.futureTotalCost, 0);
  const totalMonthlySavings = childResults.reduce(
    (s, c) => s + c.requiredMonthlySavings,
    0
  );

  const avgYearsUntil =
    childResults.length > 0
      ? childResults.reduce((s, c) => s + c.yearsUntilEnrollment, 0) /
        childResults.length
      : 0;

  const currentSavingsFV =
    currentSavings * Math.pow(1 + expectedReturn, avgYearsUntil);

  const gap = totalFutureCost - currentSavingsFV;

  return {
    children: childResults,
    totalFutureCost,
    totalMonthlySavings,
    currentSavingsFV,
    gap,
  };
}

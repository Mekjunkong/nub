import type {
  InflationInputs,
  InflationResults,
  InflationYearProjection,
} from "@/types/calculator";

export function calculateInflation(inputs: InflationInputs): InflationResults {
  const { currentMonthlyExpenses, inflationRate, yearsToProject, oneTimeExpenses } = inputs;

  const annualExpenses = currentMonthlyExpenses * 12;
  const yearlyProjections: InflationYearProjection[] = [];
  let cumulativeCost = 0;

  for (let year = 1; year <= yearsToProject; year++) {
    const inflationMultiplier = Math.pow(1 + inflationRate, year);
    let nominalExpenses = annualExpenses * inflationMultiplier;

    // Add any one-time expenses that fall in this year (inflated)
    for (const expense of oneTimeExpenses) {
      if (expense.year === year) {
        nominalExpenses += expense.amount * inflationMultiplier;
      }
    }

    cumulativeCost += nominalExpenses;

    yearlyProjections.push({
      year,
      nominalExpenses,
      realPurchasingPower: annualExpenses,
      cumulativeCost,
    });
  }

  const purchasingPowerLoss =
    1 - 1 / Math.pow(1 + inflationRate, yearsToProject);

  return {
    yearlyProjections,
    totalLifetimeCost: cumulativeCost,
    purchasingPowerLoss,
  };
}

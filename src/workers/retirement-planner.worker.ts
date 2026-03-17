import {
  compoundInterest,
  presentValueAnnuity,
} from "@/lib/finance-math";
import type {
  RetirementInputs,
  RetirementResults,
  YearProjection,
  HealthScoreBreakdown,
} from "@/types/calculator";

/**
 * Calculate retirement projections and health score.
 * Exported for direct testing; also used as Web Worker message handler.
 */
export function calculateRetirement(
  inputs: RetirementInputs
): RetirementResults {
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const retirementYears = inputs.lifeExpectancy - inputs.retirementAge;
  const monthsToRetirement = yearsToRetirement * 12;
  const monthlyReturn = inputs.expectedReturn / 12;

  // === Calculate projected corpus at retirement ===
  let currentSalary = inputs.monthlySalary;
  const projectionByYear: YearProjection[] = [];
  let runningContributions = 0;
  let runningSavings = inputs.currentSavings;

  for (let year = 1; year <= yearsToRetirement; year++) {
    const age = inputs.currentAge + year;
    currentSalary *= 1 + inputs.salaryGrowthRate;

    // Base monthly contribution
    let monthlyContrib = inputs.monthlyContribution;

    // Add employment-specific contributions
    if (inputs.employmentType === "government") {
      // GPF: employee 3% + government match 3% + compensation 2% + initial 2%
      const gpfMonthly = currentSalary * inputs.gpfContributionRate;
      const govMatch = currentSalary * inputs.gpfContributionRate; // government matches
      const govCompensation = currentSalary * 0.02;
      monthlyContrib += gpfMonthly + govMatch + govCompensation;
    } else if (inputs.employmentType === "private") {
      // PVD: employee + employer match
      const pvdMonthly = currentSalary * inputs.pvdContributionRate;
      const employerMatch = currentSalary * inputs.employerMatchRate;
      monthlyContrib += pvdMonthly + employerMatch;
    }
    // Freelance: no employer contributions

    const annualContrib = monthlyContrib * 12;
    runningContributions += annualContrib;

    // Grow savings for this year
    runningSavings =
      (runningSavings + annualContrib) * (1 + inputs.expectedReturn);

    const inflatedExpenses =
      inputs.monthlyExpenses *
      Math.pow(1 + inputs.inflationRate, year);

    projectionByYear.push({
      year: new Date().getFullYear() + year,
      age,
      salary: currentSalary,
      savings: runningSavings,
      expenses: inflatedExpenses,
      cumulativeContributions: runningContributions,
    });
  }

  // Add GPF current value grown for government employees
  let projectedCorpus = runningSavings;
  if (inputs.employmentType === "government" && inputs.currentGpfValue > 0) {
    projectedCorpus += compoundInterest(
      inputs.currentGpfValue,
      inputs.expectedReturn,
      yearsToRetirement
    );
  }

  // === Calculate required corpus ===

  // Future monthly expenses at retirement (inflation-adjusted)
  const futureMonthlyExpenses =
    inputs.monthlyExpenses *
    Math.pow(1 + inputs.inflationRate, yearsToRetirement);

  // Required corpus = PV of annuity of future expenses over retirement years
  // Use real return (adjusted for inflation during retirement)
  const realMonthlyReturn =
    (1 + inputs.expectedReturn / 12) / (1 + inputs.inflationRate / 12) - 1;

  const requiredCorpus =
    presentValueAnnuity(
      futureMonthlyExpenses,
      realMonthlyReturn,
      retirementYears * 12
    ) + inputs.legacyAmount;

  // === Calculate gap ===
  const gap = Math.max(0, requiredCorpus - projectedCorpus);

  // Monthly shortfall: how much more per month to close the gap
  let monthlyShortfall = 0;
  if (gap > 0 && monthsToRetirement > 0) {
    // PMT needed to accumulate 'gap' at given return
    const r = monthlyReturn;
    if (r === 0) {
      monthlyShortfall = gap / monthsToRetirement;
    } else {
      monthlyShortfall =
        (gap * r) / (Math.pow(1 + r, monthsToRetirement) - 1);
    }
  }

  // === Calculate Health Score ===
  const fundedRatio = Math.min(1.5, projectedCorpus / requiredCorpus);
  const fundingScore = Math.min(60, fundedRatio * 60);

  const savingsRate =
    inputs.monthlySalary > 0
      ? inputs.monthlyContribution / inputs.monthlySalary
      : 0;

  const breakdown: HealthScoreBreakdown = {
    fundingScore: Math.round(fundingScore),
    diversificationBonus: inputs.hasDiversifiedPortfolio ? 10 : 0,
    savingsRateBonus: savingsRate >= 0.15 ? 10 : 0,
    timeHorizonBonus: yearsToRetirement >= 15 ? 10 : 0,
    insuranceBonus: inputs.hasInsurance ? 10 : 0,
  };

  const rawScore =
    breakdown.fundingScore +
    breakdown.diversificationBonus +
    breakdown.savingsRateBonus +
    breakdown.timeHorizonBonus +
    breakdown.insuranceBonus;

  const healthScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    gap,
    requiredCorpus,
    projectedCorpus,
    projectionByYear,
    healthScore,
    healthScoreBreakdown: breakdown,
    monthlyShortfall,
    fundedRatio,
  };
}

// Web Worker message handler
if (typeof self !== "undefined" && typeof (self as any).onmessage !== "undefined") {
  self.onmessage = (e: MessageEvent<RetirementInputs>) => {
    const results = calculateRetirement(e.data);
    self.postMessage(results);
  };
}

import {
  normalRandom,
  presentValueAnnuity,
  futureValueAnnuity,
  futureValue,
} from "@/lib/finance-math";
import type {
  Bumnan95Inputs,
  Bumnan95Results,
  Bumnan95Tier,
} from "@/types/calculator";

const TIER_MULTIPLIERS = [0, 0.5, 1.0, 1.5, 2.0, 2.5];

/**
 * Determine status label from success rate.
 */
function statusFromRate(rate: number): Bumnan95Tier["status"] {
  if (rate >= 0.95) return "SECURED";
  if (rate >= 0.8) return "STRONG";
  if (rate >= 0.6) return "MODERATE";
  return "RISKY";
}

/**
 * Run Monte Carlo survival simulation for a single tier.
 * Returns fraction of simulations where wealth stays above 0 through retirement.
 */
function monteCarloSurvival(
  startingWealth: number,
  monthlyWithdrawal: number,
  monthlyPension: number,
  monthlyReturn: number,
  monthlySD: number,
  monthlyInflation: number,
  retirementMonths: number,
  simulations: number
): number {
  let survived = 0;

  for (let sim = 0; sim < simulations; sim++) {
    let wealth = startingWealth;
    let withdrawal = monthlyWithdrawal;
    let alive = true;

    for (let m = 1; m <= retirementMonths; m++) {
      // Inflate withdrawal annually
      if (m > 1 && (m - 1) % 12 === 0) {
        withdrawal *= 1 + monthlyInflation * 12;
      }

      // Net withdrawal = expenses - pension income
      const netWithdrawal = Math.max(0, withdrawal - monthlyPension);

      // Apply random return
      const r = normalRandom(monthlyReturn, monthlySD);
      wealth = wealth * (1 + r) - netWithdrawal;

      if (wealth <= 0) {
        alive = false;
        break;
      }
    }

    if (alive) survived++;
  }

  return survived / simulations;
}

/**
 * Run Bumnan 95 Annuity Planner.
 */
export function runBumnan95(inputs: Bumnan95Inputs): Bumnan95Results {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    inflationRate,
    portfolioReturn,
    portfolioSD,
    currentSavings,
    governmentPension,
    annuityStartAge,
    annuityPaymentYears,
    annuityRate,
    simulations,
  } = inputs;

  const yearsToRetirement = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;
  const retirementMonths = retirementYears * 12;

  // Monthly rates
  const monthlyReturn = portfolioReturn / 12;
  const monthlySD = portfolioSD / Math.sqrt(12);
  const monthlyInflation = inflationRate / 12;

  // Real rate for PV calculations
  const realRate = (1 + portfolioReturn) / (1 + inflationRate) - 1;
  const monthlyRealRate = realRate / 12;

  // Inflation-adjusted monthly expenses at retirement
  const retirementMonthlyExpenses =
    monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);

  // Target corpus: PV of inflation-adjusted retirement expenses over retirement period
  const targetCorpus = presentValueAnnuity(
    retirementMonthlyExpenses,
    monthlyRealRate,
    retirementMonths
  );

  // Estimated GPF: PV of government pension over retirement
  const estimatedGPF = presentValueAnnuity(
    governmentPension,
    monthlyRealRate,
    retirementMonths
  );

  // Projected savings at retirement (FV of current savings + contributions)
  const projectedSavings = futureValue(
    currentSavings,
    portfolioReturn,
    yearsToRetirement
  );

  // Pension lump sum (projected savings value)
  const pensionLumpSum = projectedSavings;

  // Retirement gap
  const retirementGap = targetCorpus - estimatedGPF - projectedSavings;
  const gapStatus: Bumnan95Results["gapStatus"] =
    retirementGap <= 0 ? "SAFE" : "GAP_EXISTS";

  // --- Generate 6 pension tiers ---
  const tiers: Bumnan95Tier[] = TIER_MULTIPLIERS.map((multiplier) => {
    const monthlyPension = multiplier * monthlyExpenses;

    // Run Monte Carlo survival
    const successRate = monteCarloSurvival(
      targetCorpus,
      retirementMonthlyExpenses,
      monthlyPension + governmentPension,
      monthlyReturn,
      monthlySD,
      monthlyInflation,
      retirementMonths,
      simulations
    );

    // Required portfolio: PV of net withdrawals
    const netMonthlyNeed = Math.max(
      0,
      retirementMonthlyExpenses - monthlyPension - governmentPension
    );
    const requiredPortfolio = presentValueAnnuity(
      netMonthlyNeed,
      monthlyRealRate,
      retirementMonths
    );

    // Monthly saving needed to accumulate required portfolio
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyRateForSaving = portfolioReturn / 12;
    let monthlySaving = 0;
    if (monthsToRetirement > 0 && requiredPortfolio > currentSavings) {
      const gap = requiredPortfolio - futureValue(currentSavings, portfolioReturn, yearsToRetirement);
      if (gap > 0) {
        const fvFactor =
          monthlyRateForSaving === 0
            ? monthsToRetirement
            : (Math.pow(1 + monthlyRateForSaving, monthsToRetirement) - 1) /
              monthlyRateForSaving;
        monthlySaving = gap / fvFactor;
      }
    }

    return {
      monthlyPension,
      successRate,
      requiredPortfolio,
      monthlySaving: Math.max(0, monthlySaving),
      status: statusFromRate(successRate),
    };
  });

  // --- Annuity calculations ---
  const paymentDuration = annuityPaymentYears;
  const monthlyAnnuityRate = annuityRate;
  const annualPremium =
    presentValueAnnuity(
      retirementMonthlyExpenses,
      monthlyAnnuityRate,
      paymentDuration * 12
    ) / paymentDuration;
  const totalPremiumPaid = annualPremium * paymentDuration;

  // --- Gap-closing strategies ---
  const lumpSumNeeded = Math.max(0, retirementGap);
  const monthlyTopUp =
    yearsToRetirement > 0 && retirementGap > 0
      ? retirementGap /
        ((Math.pow(1 + monthlyReturn, yearsToRetirement * 12) - 1) /
          monthlyReturn)
      : 0;

  // --- Recommended strategy ---
  let recommendedStrategy: string;
  if (gapStatus === "SAFE") {
    recommendedStrategy =
      "Your projected savings exceed the retirement target. Consider increasing legacy or lifestyle goals.";
  } else if (monthlyTopUp < monthlyExpenses * 0.3) {
    recommendedStrategy =
      "Monthly top-up is manageable. Consider systematic monthly contributions to close the gap.";
  } else {
    recommendedStrategy =
      "The gap is significant. Consider a combination of lump-sum investment and monthly top-ups, along with annuity protection.";
  }

  return {
    targetCorpus,
    estimatedGPF,
    pensionLumpSum,
    retirementGap,
    gapStatus,
    tiers,
    annualPremium,
    paymentDuration,
    totalPremiumPaid,
    lumpSumNeeded,
    monthlyTopUp,
    recommendedStrategy,
  };
}

// Web Worker message handler
if (
  typeof self !== "undefined" &&
  typeof (self as any).onmessage !== "undefined"
) {
  self.onmessage = (e: MessageEvent<Bumnan95Inputs>) => {
    const results = runBumnan95(e.data);
    self.postMessage(results);
  };
}

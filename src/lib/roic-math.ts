/**
 * ROIC Math Library
 * Pure functions for Return on Invested Capital analysis, Sloan accrual ratio,
 * and Gordon Growth Model fair value estimation.
 */

export interface RoicInputs {
  ticker: string;
  ebit: number;
  taxRate: number;
  totalAssets: number;
  currentLiabilities: number;
  cashAndEquivalents: number;
  netIncome: number;
  operatingCashFlow: number;
  wacc: number;
  growthRate: number;
}

export interface RoicResults {
  nopat: number;
  investedCapital: number;
  roic: number;
  sloanRatio: number;
  fairEquityValue: number;
  roicVsWacc: number;
  qualityRating: "Excellent" | "Good" | "Moderate" | "Poor";
}

/**
 * Calculate ROIC metrics for a single stock.
 * @throws Error if growthRate >= wacc (Gordon Growth Model undefined)
 */
export function calculateRoic(inputs: RoicInputs): RoicResults {
  if (inputs.growthRate >= inputs.wacc) {
    throw new Error("Growth rate must be less than WACC");
  }

  const nopat = inputs.ebit * (1 - inputs.taxRate);
  const investedCapital =
    inputs.totalAssets - inputs.currentLiabilities - inputs.cashAndEquivalents;
  const roic = investedCapital > 0 ? nopat / investedCapital : 0;
  const sloanRatio =
    inputs.totalAssets > 0
      ? (inputs.netIncome - inputs.operatingCashFlow) / inputs.totalAssets
      : 0;
  const fairEquityValue = nopat / (inputs.wacc - inputs.growthRate);
  const roicVsWacc = roic - inputs.wacc;

  let qualityRating: RoicResults["qualityRating"];
  if (roic > 0.20 && sloanRatio < 0) {
    qualityRating = "Excellent";
  } else if (roic > 0.12) {
    qualityRating = "Good";
  } else if (roic > 0.08) {
    qualityRating = "Moderate";
  } else {
    qualityRating = "Poor";
  }

  return {
    nopat,
    investedCapital,
    roic,
    sloanRatio,
    fairEquityValue,
    roicVsWacc,
    qualityRating,
  };
}

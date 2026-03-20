import type {
  SocialSecurityInputs,
  SocialSecurityResults,
  SectionResult,
} from "@/types/calculator";

// Section 33: Employee — 5% of salary capped at base 15,000 THB/month
const SECTION_33_CAP = 15000;
const SECTION_33_RATE = 0.05;
const SECTION_33_PENSION_FACTOR = 0.2;
const SECTION_33_MAX_YEARS = 25;

// Section 39: Voluntary (formerly employed) — fixed 432 THB/month, base 4,800
const SECTION_39_MONTHLY = 432;
const SECTION_39_BASE = 4800;
const SECTION_39_PENSION_FACTOR = 0.2;
const SECTION_39_MAX_YEARS = 25;

// Section 40: Self-employed — 3 options, no monthly pension
const SECTION_40_OPTIONS = [
  { option: 1, monthly: 100 },
  { option: 2, monthly: 150 },
  { option: 3, monthly: 300 },
] as const;

function calcSection33(
  monthlyIncome: number,
  totalYears: number
): SectionResult {
  const base = Math.min(monthlyIncome, SECTION_33_CAP);
  const monthlyContribution = base * SECTION_33_RATE;
  const cappedYears = Math.min(totalYears, SECTION_33_MAX_YEARS);
  const monthlyPension =
    totalYears >= 15
      ? (base * SECTION_33_PENSION_FACTOR * cappedYears) / 12
      : 0;
  const totalContributed = monthlyContribution * totalYears * 12;
  const breakEvenYears =
    monthlyPension > 0 ? totalContributed / (monthlyPension * 12) : Infinity;

  return {
    section: "33",
    monthlyContribution,
    monthlyPension,
    totalContributed,
    breakEvenYears,
  };
}

function calcSection39(totalYears: number): SectionResult {
  const monthlyContribution = SECTION_39_MONTHLY;
  const cappedYears = Math.min(totalYears, SECTION_39_MAX_YEARS);
  const monthlyPension =
    totalYears >= 15
      ? (SECTION_39_BASE * SECTION_39_PENSION_FACTOR * cappedYears) / 12
      : 0;
  const totalContributed = monthlyContribution * totalYears * 12;
  const breakEvenYears =
    monthlyPension > 0 ? totalContributed / (monthlyPension * 12) : Infinity;

  return {
    section: "39",
    monthlyContribution,
    monthlyPension,
    totalContributed,
    breakEvenYears,
  };
}

function calcSection40(totalYears: number): SectionResult {
  // Use the highest option (300 THB) for comparison purposes
  const monthlyContribution = SECTION_40_OPTIONS[2].monthly;
  const monthlyPension = 0; // No monthly pension benefit
  const totalContributed = monthlyContribution * totalYears * 12;
  const breakEvenYears = Infinity;

  return {
    section: "40",
    monthlyContribution,
    monthlyPension,
    totalContributed,
    breakEvenYears,
  };
}

function pickRecommendation(sections: SectionResult[]): string {
  // Find the section with the best pension-to-contribution ratio
  let bestSection = sections[0];
  let bestRatio = -1;

  for (const s of sections) {
    if (s.monthlyPension === 0) continue;
    const ratio = s.monthlyPension / s.monthlyContribution;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestSection = s;
    }
  }

  return bestSection.section;
}

export function calculateSocialSecurity(
  inputs: SocialSecurityInputs
): SocialSecurityResults {
  const yearsUntilRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const totalYears = inputs.yearsContributed + yearsUntilRetirement;

  const sections: SectionResult[] = [
    calcSection33(inputs.monthlyIncome, totalYears),
    calcSection39(totalYears),
    calcSection40(totalYears),
  ];

  const recommended = pickRecommendation(sections);

  return { sections, recommended };
}

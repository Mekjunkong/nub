import type { EmploymentType } from "./database";

// ===== Retirement Planner =====

export interface RetirementInputsBase {
  employmentType: EmploymentType;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlySalary: number;
  monthlyExpenses: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number; // annual
  inflationRate: number; // annual
  salaryGrowthRate: number; // annual
  legacyAmount: number;
  hasInsurance: boolean;
  hasDiversifiedPortfolio: boolean;
}

export interface GovernmentInputs extends RetirementInputsBase {
  employmentType: "government";
  gpfContributionRate: number; // fraction, e.g. 0.03
  currentGpfValue: number;
  serviceStartYear: number;
  positionLevel: number;
}

export interface PrivateInputs extends RetirementInputsBase {
  employmentType: "private";
  pvdContributionRate: number;
  employerMatchRate: number;
  hasSocialSecurity: boolean;
}

export interface FreelanceInputs extends RetirementInputsBase {
  employmentType: "freelance";
  section40SocialSecurity: boolean;
}

export type RetirementInputs =
  | GovernmentInputs
  | PrivateInputs
  | FreelanceInputs;

export interface YearProjection {
  year: number;
  age: number;
  salary: number;
  savings: number;
  expenses: number;
  cumulativeContributions: number;
}

export interface HealthScoreBreakdown {
  fundingScore: number; // max 60
  diversificationBonus: number; // 0 or 10
  savingsRateBonus: number; // 0 or 10
  timeHorizonBonus: number; // 0 or 10
  insuranceBonus: number; // 0 or 10
}

export interface RetirementResults {
  gap: number;
  requiredCorpus: number;
  projectedCorpus: number;
  projectionByYear: YearProjection[];
  healthScore: number;
  healthScoreBreakdown: HealthScoreBreakdown;
  monthlyShortfall: number;
  fundedRatio: number;
}

// ===== Monte Carlo =====

export interface MonteCarloInputs {
  currentMonthlyExpenses: number;
  yearsToRetirement: number;
  inflationRate: number; // annual
  retirementAge: number;
  lifeExpectancy: number;
  lumpSum: number;
  governmentPension: number; // monthly
  annuity: number; // monthly
  portfolioExpectedReturn: number; // monthly
  portfolioSD: number; // monthly
  inflationExpectedReturn: number; // monthly
  inflationSD: number; // monthly
  rounds?: number;
}

export interface MonteCarloResults {
  survivalRate: number;
  wealthPaths: number[][]; // sampled paths for charting
  percentiles: {
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
  };
  medianFinalWealth: number;
  avgFinalWealth: number;
  partial: boolean;
  rounds: number;
}

// ===== Stress Test =====

export interface StressTestInputs {
  expectedReturn: number; // monthly
  sd: number; // monthly
  periods: number;
  dcaAmount: number;
  bonusAmount: number;
  bonusFrequency: number; // every N months
  targetReturn: number; // for doubling prob
  varStartPeriod: number;
  blackSwanStartPeriod: number;
  blackSwanConsecutivePeriods: number;
  simulations: number;
}

export interface ScenarioResult {
  name: string;
  equityCurve: number[];
  maxDrawdown: number;
  recoveryTime: number;
  finalWealth: number;
}

export interface StressTestResults {
  scenarios: ScenarioResult[];
  doublingProbability: number;
  medianDrawdown: number;
  worstDrawdown: number;
}

// ===== MPT Optimizer =====

export interface MptAsset {
  name: string;
  ticker: string;
  expectedReturn: number; // annual
  standardDeviation: number; // annual
}

export interface MptInputs {
  assets: MptAsset[];
  correlationMatrix: number[][];
  riskFreeRate: number;
  frontierPoints?: number; // default 100
}

export interface PortfolioPoint {
  weights: number[];
  expectedReturn: number;
  risk: number; // standard deviation
  sharpeRatio: number;
}

export interface MptResults {
  frontier: PortfolioPoint[];
  maxSharpe: PortfolioPoint;
  minVol: PortfolioPoint;
}

// ===== DCA Tracker =====

export type DcaStrategy = "static" | "glidepath" | "daa";

export interface DcaInputs {
  monthlyAmount: number;
  assets: {
    name: string;
    weight: number;
    monthlyReturns: number[]; // historical or simulated
  }[];
  rebalanceFrequency: number; // months
  investmentMonths: number;
  strategy: DcaStrategy;
  // Glidepath-specific
  initialEquityWeight?: number;
  finalEquityWeight?: number;
  equityAssetIndex?: number; // which asset is equity
  // DAA-specific
  momentumLookback?: number; // months
}

export interface TradeLogEntry {
  month: number;
  year: number;
  action: "DCA" | "Rebal";
  weights: number[];
  totalWealth: number;
  drawdownPercent: number;
}

export interface DcaStrategyResult {
  totalInvested: number;
  finalWealth: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  tradeLog: TradeLogEntry[];
}

export interface DcaResults {
  static: DcaStrategyResult;
  glidepath: DcaStrategyResult;
  daa: DcaStrategyResult;
}

// ===== Tax Optimizer =====

export interface TaxInputs {
  annualIncome: number;
  ssfAmount: number;
  rmfAmount: number;
  lifeInsurance: number;
  healthInsurance: number;
  pensionInsurance: number;
  pvdContribution: number;
  socialSecurityContribution: number;
  personalAllowance?: number;
  spouseAllowance?: number;
  childAllowance?: number;
  parentAllowance?: number;
  housingLoanInterest?: number;
  donationAmount?: number;
}

export interface TaxBracketResult {
  bracket: string;
  rate: number;
  taxableIncome: number;
  tax: number;
}

export interface TaxRecommendation {
  instrument: string;
  currentAmount: number;
  recommendedAmount: number;
  maxAllowed: number;
  additionalTaxSaved: number;
}

export interface TaxResults {
  currentTax: number;
  optimizedTax: number;
  taxSaved: number;
  effectiveTaxRate: number;
  optimizedEffectiveTaxRate: number;
  brackets: TaxBracketResult[];
  recommendations: TaxRecommendation[];
  totalDeductions: number;
}

// ===== ROIC Analyzer =====

export type { RoicInputs, RoicResults } from "@/lib/roic-math";

// ===== Cashflow Tracker =====

export type { CashflowTransactionInput, CashflowResults } from "@/lib/cashflow-math";

// ===== Wealth Pillars =====

export interface InsurancePolicy {
  name: string;
  type: "wholelife" | "saving" | "annuity" | "term" | "critical_illness" | "health";
  deathBenefit: number;
  ciCoverage: number;
  surrenderValue: number;
  annualPremium: number;
}

export interface WealthPillarData {
  emergency: {
    balance: number;
    monthlyExpenses: number;
    monthsCoverage: number;
    status: "STRONG" | "MODERATE" | "WEAK";
  };
  education: {
    currentAmount: number;
    goalAmount: number;
    progressPercent: number;
    targetDate: string;
  };
  retirement: {
    gpfValue: number;
    rmfValue: number;
    otherRetirement: number;
    totalRetirement: number;
    targetCorpus: number;
    progressPercent: number;
  };
  insurance: {
    totalDeathBenefit: number;
    totalCICoverage: number;
    totalSurrenderValue: number;
    policies: InsurancePolicy[];
  };
}

// ===== GPF Portfolio Optimizer =====

export interface GpfOptimizerInputs {
  currentHoldings: { bondPlan: number; equityPlan: number; goldPlan: number };
  monthlyContribution: number;
  investmentYears: number;
  riskFreeRate: number;
  assetReturns: number[];
  assetSDs: number[];
  correlationMatrix: number[][];
  rebalanceFrequency: number;
  simulations: number;
}

export interface GpfRebalanceAction {
  asset: string;
  action: "BUY" | "SELL" | "HOLD";
  amount: number;
}

export interface GpfDrawdownYear {
  year: number;
  avgMDD: number;
  worstMDD: number;
  recoveryMonths: number;
}

export interface GpfOptimizerResults {
  maxSharpe: { weights: number[]; expectedReturn: number; risk: number; sharpeRatio: number };
  minVol: { weights: number[]; expectedReturn: number; risk: number; sharpeRatio: number };
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
  probabilityOfRuin: number;
  rebalanceActions: GpfRebalanceAction[];
  wealthProjections: { average: number; median: number; conservative: number; bull: number; successRate: number };
  maxDrawdownByYear: GpfDrawdownYear[];
}

// ===== TIPP/VPPI Portfolio Protection =====

export interface TippInputs {
  initialCapital: number;
  floorPercentage: number;
  maxMultiplier: number;
  riskFreeRate: number;
  assets: { name: string; monthlyReturns: number[] }[];
  correlationMatrix: number[][];
  targetVolatility: number;
  rebalanceThreshold: number;
  simulationMonths: number;
}

export interface TippWealthPoint {
  month: number;
  wealth: number;
  floor: number;
  multiplier: number;
  action: string;
}

export interface TippResults {
  expectedReturn: number;
  annualSD: number;
  sharpeRatio: number;
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
  currentMultiplier: number;
  floorValue: number;
  cushion: number;
  safetyStatus: "SAFE" | "WARNING" | "DANGER";
  wealthPath: TippWealthPoint[];
  finalWealth: number;
  maxDrawdown: number;
  riskyWeight: number;
  safeWeight: number;
}

// ===== Portfolio Health Dashboard =====

export interface PortfolioHealthInputs {
  totalNAV: number;
  previousNAV: number;
  monthlyDCA: number;
  holdings: { asset: string; weight: number; expectedReturn: number; sd: number }[];
  correlationMatrix: number[][];
  benchmarkReturn: number;
  riskFreeRate: number;
  investmentYears: number;
  simulations: number;
}

export interface DrawdownYearAnalysis {
  year: number;
  avgMDD: number;
  worstMDD: number;
  avgRecoveryMonths: number;
  worstRecoveryMonths: number;
}

export interface PortfolioHealthResults {
  monthlyReturn: number;
  targetReturn: number;
  projectedReturn: number;
  benchmarkReturn: number;
  alpha: number;
  sharpeRatio: number;
  sharpeRating: string;
  portfolioRisk: number;
  riskLevel: "Low" | "Moderate" | "High";
  drawdownAnalysis: DrawdownYearAnalysis[];
  performanceComment: string;
  riskComment: string;
}

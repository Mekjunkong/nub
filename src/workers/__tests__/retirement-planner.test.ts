import { describe, it, expect } from "vitest";
import { calculateRetirement } from "../retirement-planner.worker";
import type {
  GovernmentInputs,
  PrivateInputs,
  FreelanceInputs,
} from "@/types/calculator";

const governmentInputs: GovernmentInputs = {
  employmentType: "government",
  currentAge: 30,
  retirementAge: 60,
  lifeExpectancy: 85,
  monthlySalary: 40000,
  monthlyExpenses: 25000,
  currentSavings: 200000,
  monthlyContribution: 5000,
  expectedReturn: 0.06,
  inflationRate: 0.03,
  salaryGrowthRate: 0.03,
  legacyAmount: 0,
  hasInsurance: false,
  hasDiversifiedPortfolio: false,
  gpfContributionRate: 0.03,
  currentGpfValue: 100000,
  serviceStartYear: 2020,
  positionLevel: 5,
};

const privateInputs: PrivateInputs = {
  employmentType: "private",
  currentAge: 35,
  retirementAge: 60,
  lifeExpectancy: 85,
  monthlySalary: 60000,
  monthlyExpenses: 35000,
  currentSavings: 500000,
  monthlyContribution: 10000,
  expectedReturn: 0.07,
  inflationRate: 0.03,
  salaryGrowthRate: 0.04,
  legacyAmount: 0,
  hasInsurance: true,
  hasDiversifiedPortfolio: true,
  pvdContributionRate: 0.05,
  employerMatchRate: 0.05,
  hasSocialSecurity: true,
};

describe("calculateRetirement", () => {
  describe("Government employee", () => {
    it("calculates retirement gap", () => {
      const results = calculateRetirement(governmentInputs);
      expect(results.requiredCorpus).toBeGreaterThan(0);
      expect(results.projectedCorpus).toBeGreaterThan(0);
      expect(typeof results.gap).toBe("number");
    });

    it("includes GPF contributions in projected corpus", () => {
      const withGpf = calculateRetirement(governmentInputs);
      const withoutGpf = calculateRetirement({
        ...governmentInputs,
        gpfContributionRate: 0,
        currentGpfValue: 0,
      });
      expect(withGpf.projectedCorpus).toBeGreaterThan(
        withoutGpf.projectedCorpus
      );
    });

    it("generates year-by-year projections", () => {
      const results = calculateRetirement(governmentInputs);
      const yearsToRetirement =
        governmentInputs.retirementAge - governmentInputs.currentAge;
      expect(results.projectionByYear.length).toBe(yearsToRetirement);
      expect(results.projectionByYear[0].age).toBe(
        governmentInputs.currentAge + 1
      );
    });
  });

  describe("Private employee", () => {
    it("includes PVD and employer match in projected corpus", () => {
      const withMatch = calculateRetirement(privateInputs);
      const noMatch = calculateRetirement({
        ...privateInputs,
        employerMatchRate: 0,
      });
      expect(withMatch.projectedCorpus).toBeGreaterThan(
        noMatch.projectedCorpus
      );
    });

    it("produces positive projected corpus", () => {
      const results = calculateRetirement(privateInputs);
      expect(results.projectedCorpus).toBeGreaterThan(0);
    });
  });

  describe("Freelance", () => {
    it("calculates retirement for freelance", () => {
      const freelanceInputs: FreelanceInputs = {
        employmentType: "freelance",
        currentAge: 28,
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlySalary: 50000,
        monthlyExpenses: 30000,
        currentSavings: 100000,
        monthlyContribution: 8000,
        expectedReturn: 0.06,
        inflationRate: 0.03,
        salaryGrowthRate: 0.02,
        legacyAmount: 0,
        hasInsurance: false,
        hasDiversifiedPortfolio: false,
        section40SocialSecurity: true,
      };
      const results = calculateRetirement(freelanceInputs);
      expect(results.requiredCorpus).toBeGreaterThan(0);
      expect(results.healthScore).toBeGreaterThanOrEqual(0);
      expect(results.healthScore).toBeLessThanOrEqual(100);
    });
  });

  describe("Health Score", () => {
    it("calculates base score from funded ratio", () => {
      // Increase savings to get a funded ratio around 0.5
      const inputs: GovernmentInputs = {
        ...governmentInputs,
        currentSavings: 200000,
        monthlyContribution: 3000,
        hasInsurance: false,
        hasDiversifiedPortfolio: false,
      };
      const results = calculateRetirement(inputs);
      // Score should be fundedRatio * 60 (base only, no bonuses)
      expect(results.healthScoreBreakdown.fundingScore).toBeGreaterThan(0);
      expect(results.healthScoreBreakdown.fundingScore).toBeLessThanOrEqual(
        60
      );
      expect(results.healthScoreBreakdown.diversificationBonus).toBe(0);
      expect(results.healthScoreBreakdown.insuranceBonus).toBe(0);
    });

    it("includes all bonuses when conditions are met", () => {
      const inputs: PrivateInputs = {
        ...privateInputs,
        hasInsurance: true,
        hasDiversifiedPortfolio: true,
        monthlyContribution: 20000, // high savings rate
      };
      const results = calculateRetirement(inputs);
      expect(results.healthScoreBreakdown.diversificationBonus).toBe(10);
      expect(results.healthScoreBreakdown.insuranceBonus).toBe(10);
      // savings rate = 20000/60000 = 33%, should get bonus
      expect(results.healthScoreBreakdown.savingsRateBonus).toBe(10);
      // years to retirement = 25, should get time horizon bonus
      expect(results.healthScoreBreakdown.timeHorizonBonus).toBe(10);
      // All bonuses present
      expect(results.healthScore).toBeGreaterThanOrEqual(30);
    });

    it("clamps health score between 0 and 100", () => {
      const results = calculateRetirement(governmentInputs);
      expect(results.healthScore).toBeGreaterThanOrEqual(0);
      expect(results.healthScore).toBeLessThanOrEqual(100);
    });

    it("calculates monthly shortfall when there is a gap", () => {
      const inputs: FreelanceInputs = {
        employmentType: "freelance",
        currentAge: 55,
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlySalary: 30000,
        monthlyExpenses: 25000,
        currentSavings: 100000,
        monthlyContribution: 2000,
        expectedReturn: 0.04,
        inflationRate: 0.03,
        salaryGrowthRate: 0,
        legacyAmount: 0,
        hasInsurance: false,
        hasDiversifiedPortfolio: false,
        section40SocialSecurity: false,
      };
      const results = calculateRetirement(inputs);
      // With low savings and close to retirement, should have a gap
      expect(results.gap).toBeGreaterThan(0);
      expect(results.monthlyShortfall).toBeGreaterThan(0);
    });
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

// Mock recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ReferenceLine: () => <div />,
}));

import { EmploymentSelector } from "../employment-selector";
import { RetirementResults } from "../retirement-results";
import { WhatIfSliders } from "../what-if-sliders";

describe("EmploymentSelector", () => {
  it("renders 3 employment type cards", () => {
    render(<EmploymentSelector onSelect={() => {}} selected={null} />);
    expect(screen.getByTestId("employment-government")).toBeInTheDocument();
    expect(screen.getByTestId("employment-private")).toBeInTheDocument();
    expect(screen.getByTestId("employment-freelance")).toBeInTheDocument();
  });

  it("calls onSelect when a card is clicked", () => {
    const onSelect = vi.fn();
    render(<EmploymentSelector onSelect={onSelect} selected={null} />);
    fireEvent.click(screen.getByTestId("employment-government"));
    expect(onSelect).toHaveBeenCalledWith("government");
  });

  it("highlights the selected card", () => {
    render(
      <EmploymentSelector onSelect={() => {}} selected="government" />
    );
    const govCard = screen.getByTestId("employment-government");
    expect(govCard.className).toContain("border-primary");
  });
});

describe("RetirementResults", () => {
  const mockResults = {
    gap: 2000000,
    requiredCorpus: 10000000,
    projectedCorpus: 8000000,
    projectionByYear: [
      { year: 2027, age: 31, salary: 41200, savings: 300000, expenses: 25750, cumulativeContributions: 60000 },
      { year: 2028, age: 32, salary: 42436, savings: 420000, expenses: 26522, cumulativeContributions: 120000 },
    ],
    healthScore: 65,
    healthScoreBreakdown: {
      fundingScore: 48,
      diversificationBonus: 0,
      savingsRateBonus: 10,
      timeHorizonBonus: 10,
      insuranceBonus: 0,
    },
    monthlyShortfall: 5000,
    fundedRatio: 0.8,
  };

  it("renders health score gauge", () => {
    render(<RetirementResults results={mockResults} />);
    expect(screen.getByText("65")).toBeInTheDocument();
  });

  it("displays retirement gap", () => {
    render(<RetirementResults results={mockResults} />);
    expect(screen.getByText(/2,000,000/)).toBeInTheDocument();
  });

  it("shows save plan button", () => {
    render(<RetirementResults results={mockResults} />);
    expect(screen.getByText(/Save Plan/i)).toBeInTheDocument();
  });

  it("shows financial disclaimer", () => {
    render(<RetirementResults results={mockResults} />);
    expect(screen.getByText(/Disclaimer/i)).toBeInTheDocument();
  });
});

describe("WhatIfSliders", () => {
  it("renders sliders for retirement age, savings, and return", () => {
    const onChange = vi.fn();
    render(
      <WhatIfSliders
        retirementAge={60}
        monthlyContribution={5000}
        expectedReturn={0.06}
        onChange={onChange}
      />
    );
    expect(screen.getByLabelText(/Retirement Age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Monthly Savings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected Return/i)).toBeInTheDocument();
  });

  it("calls onChange when slider is adjusted", () => {
    const onChange = vi.fn();
    render(
      <WhatIfSliders
        retirementAge={60}
        monthlyContribution={5000}
        expectedReturn={0.06}
        onChange={onChange}
      />
    );
    const slider = screen.getByLabelText(/Retirement Age/i);
    fireEvent.change(slider, { target: { value: "65" } });
    expect(onChange).toHaveBeenCalled();
  });
});

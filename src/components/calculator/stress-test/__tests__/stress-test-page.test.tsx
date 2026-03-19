import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key, useLocale: () => "en" }));
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

import { StressForm } from "../stress-form";
import { StressResults } from "../stress-results";

describe("StressForm", () => {
  it("renders input fields", () => {
    render(<StressForm onCalculate={() => {}} />);
    expect(screen.getByLabelText(/expectedReturn/)).toBeInTheDocument();
    expect(screen.getByLabelText(/dcaAmount/)).toBeInTheDocument();
  });
});

describe("StressResults", () => {
  const mockResults = {
    scenarios: [
      { name: "Normal", maxDrawdown: -0.05, finalWealth: 100000, recoveryTime: 3, equityCurve: [] },
      { name: "VaR (99%)", maxDrawdown: -0.15, finalWealth: 90000, recoveryTime: 8, equityCurve: [] },
      { name: "Black Swan", maxDrawdown: -0.30, finalWealth: 70000, recoveryTime: 15, equityCurve: [] },
      { name: "Combined", maxDrawdown: -0.35, finalWealth: 65000, recoveryTime: 18, equityCurve: [] },
    ],
    doublingProbability: 0.75,
    medianDrawdown: -0.15,
    worstDrawdown: -0.35,
  };

  it("shows 4 scenario names", () => {
    render(<StressResults results={mockResults} />);
    expect(screen.getAllByText("Normal").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Combined").length).toBeGreaterThanOrEqual(1);
  });

  it("shows doubling probability", () => {
    render(<StressResults results={mockResults} />);
    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });

  it("shows disclaimer", () => {
    render(<StressResults results={mockResults} />);
    expect(screen.getByText(/Disclaimer/i)).toBeInTheDocument();
  });
});

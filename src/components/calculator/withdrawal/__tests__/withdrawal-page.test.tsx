import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

import { WithdrawalForm } from "../withdrawal-form";
import { WithdrawalResults } from "../withdrawal-results";

describe("WithdrawalForm", () => {
  it("renders input fields for withdrawal simulation", () => {
    render(<WithdrawalForm onCalculate={() => {}} />);
    expect(screen.getByLabelText(/Monthly Expenses/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lump Sum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Life Expectancy/i)).toBeInTheDocument();
  });
});

describe("WithdrawalResults", () => {
  const mockResults = {
    survivalRate: 0.85,
    wealthPaths: [],
    percentiles: { p10: [1000], p25: [2000], p50: [3000], p75: [4000], p90: [5000] },
    medianFinalWealth: 3000000,
    avgFinalWealth: 3500000,
    partial: false,
    rounds: 60000,
  };

  it("shows survival gauge with rate", () => {
    render(<WithdrawalResults results={mockResults} isRefining={false} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("shows refining indicator when partial", () => {
    render(<WithdrawalResults results={mockResults} isRefining={true} />);
    expect(screen.getByText(/Refining/i)).toBeInTheDocument();
  });

  it("shows disclaimer", () => {
    render(<WithdrawalResults results={mockResults} isRefining={false} />);
    expect(screen.getByText(/Disclaimer/i)).toBeInTheDocument();
  });
});

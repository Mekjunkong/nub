import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key, useLocale: () => "en" }));
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  ScatterChart: ({ children }: any) => <div>{children}</div>,
  Scatter: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ReferenceDot: () => <div />,
}));

import { FundSelector } from "../fund-selector";
import { MptResultsView } from "../mpt-results";

describe("FundSelector", () => {
  const mockFunds = [
    { id: "1", ticker: "SCBRMS&P500", name: "S&P 500", expectedReturn: 0.08, standardDeviation: 0.1858 },
    { id: "2", ticker: "SCBRM2", name: "Bond", expectedReturn: 0.025, standardDeviation: 0.0191 },
    { id: "3", ticker: "SCBRMGOLDH", name: "Gold", expectedReturn: 0.05, standardDeviation: 0.1511 },
  ];

  it("renders fund list", () => {
    render(<FundSelector funds={mockFunds} selected={[]} onSelect={() => {}} />);
    expect(screen.getByText("SCBRMS&P500")).toBeInTheDocument();
    expect(screen.getByText("SCBRM2")).toBeInTheDocument();
  });

  it("calls onSelect when fund clicked", () => {
    const onSelect = vi.fn();
    render(<FundSelector funds={mockFunds} selected={[]} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("SCBRMS&P500"));
    expect(onSelect).toHaveBeenCalledWith(["1"]);
  });
});

describe("MptResultsView", () => {
  const mockResults = {
    frontier: [
      { weights: [0.5, 0.5], expectedReturn: 0.05, risk: 0.1, sharpeRatio: 0.3 },
    ],
    maxSharpe: { weights: [0.6, 0.4], expectedReturn: 0.06, risk: 0.12, sharpeRatio: 0.33 },
    minVol: { weights: [0.3, 0.7], expectedReturn: 0.04, risk: 0.05, sharpeRatio: 0.4 },
  };

  it("shows max Sharpe and min vol labels", () => {
    render(<MptResultsView results={mockResults} assetNames={["Equity", "Bond"]} />);
    expect(screen.getByText(/Max Sharpe/i)).toBeInTheDocument();
    expect(screen.getByText(/Min Volatility/i)).toBeInTheDocument();
  });

  it("shows disclaimer", () => {
    render(<MptResultsView results={mockResults} assetNames={["Equity", "Bond"]} />);
    expect(screen.getByText(/Disclaimer/i)).toBeInTheDocument();
  });
});

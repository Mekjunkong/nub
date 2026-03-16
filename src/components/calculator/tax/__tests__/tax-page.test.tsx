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

import { TaxForm } from "../tax-form";
import { TaxResultsView } from "../tax-results";

describe("TaxForm", () => {
  it("renders income and deduction fields", () => {
    render(<TaxForm onCalculate={() => {}} />);
    expect(screen.getByLabelText(/Annual Income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SSF/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/RMF/i)).toBeInTheDocument();
  });
});

describe("TaxResultsView", () => {
  const mockResults = {
    currentTax: 83000,
    optimizedTax: 45000,
    taxSaved: 38000,
    effectiveTaxRate: 0.083,
    optimizedEffectiveTaxRate: 0.045,
    brackets: [],
    recommendations: [
      { instrument: "SSF", currentAmount: 0, recommendedAmount: 150000, maxAllowed: 150000, additionalTaxSaved: 22500 },
    ],
    totalDeductions: 160000,
  };

  it("shows tax saved amount", () => {
    render(<TaxResultsView results={mockResults} />);
    expect(screen.getAllByText(/38,000/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows recommendations", () => {
    render(<TaxResultsView results={mockResults} />);
    expect(screen.getByText("SSF")).toBeInTheDocument();
  });

  it("shows disclaimer", () => {
    render(<TaxResultsView results={mockResults} />);
    expect(screen.getByText(/Disclaimer/i)).toBeInTheDocument();
  });
});

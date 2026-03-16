import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key, useLocale: () => "en" }));
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

import { DcaForm } from "../dca-form";
import { DcaResultsView } from "../dca-results";

describe("DcaForm", () => {
  it("renders DCA amount input and strategy options", () => {
    render(<DcaForm onCalculate={() => {}} />);
    expect(screen.getByLabelText(/Monthly DCA/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Investment Period/i)).toBeInTheDocument();
  });
});

describe("DcaResultsView", () => {
  const mockResults = {
    static: { totalInvested: 120000, finalWealth: 130000, totalReturn: 0.083, annualizedReturn: 0.08, maxDrawdown: -0.05, tradeLog: [] },
    glidepath: { totalInvested: 120000, finalWealth: 128000, totalReturn: 0.067, annualizedReturn: 0.065, maxDrawdown: -0.04, tradeLog: [] },
    daa: { totalInvested: 120000, finalWealth: 132000, totalReturn: 0.1, annualizedReturn: 0.095, maxDrawdown: -0.06, tradeLog: [] },
  };

  it("shows 3 strategy results", () => {
    render(<DcaResultsView results={mockResults} />);
    expect(screen.getAllByText(/Static/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Glidepath/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/DAA/i).length).toBeGreaterThanOrEqual(1);
  });

  it("shows disclaimer", () => {
    render(<DcaResultsView results={mockResults} />);
    expect(screen.getByText(/Disclaimer/i)).toBeInTheDocument();
  });
});

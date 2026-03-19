import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key, useLocale: () => "en" }));

import { RoicForm } from "../roic-form";
import { RoicResultsView } from "../roic-results";
import { RoicRankingTable } from "../roic-ranking-table";

describe("RoicForm", () => {
  it("renders without crashing", () => {
    render(<RoicForm onCalculate={() => {}} />);
    expect(screen.getByText("roic.inputSection")).toBeInTheDocument();
  });

  it("renders all input fields", () => {
    render(<RoicForm onCalculate={() => {}} />);
    expect(screen.getByLabelText("roic.ticker")).toBeInTheDocument();
    expect(screen.getByLabelText("roic.ebit")).toBeInTheDocument();
    expect(screen.getByLabelText("roic.taxRate (%)")).toBeInTheDocument();
    expect(screen.getByLabelText("roic.totalAssets")).toBeInTheDocument();
    expect(screen.getByLabelText("roic.currentLiabilities")).toBeInTheDocument();
    expect(screen.getByLabelText("roic.cash")).toBeInTheDocument();
    expect(screen.getByLabelText("roic.netIncome")).toBeInTheDocument();
    expect(screen.getByLabelText("roic.operatingCashFlow")).toBeInTheDocument();
    expect(screen.getByLabelText("roic.wacc (%)")).toBeInTheDocument();
    expect(screen.getByLabelText("roic.growthRate (%)")).toBeInTheDocument();
  });

  it("renders the Analyze submit button", () => {
    render(<RoicForm onCalculate={() => {}} />);
    expect(screen.getByText("roic.analyze")).toBeInTheDocument();
  });

  it("calls onCalculate when form is submitted with valid data", () => {
    const onCalculate = vi.fn();
    render(<RoicForm onCalculate={onCalculate} />);

    fireEvent.change(screen.getByLabelText("roic.ticker"), {
      target: { value: "MEGA" },
    });
    fireEvent.change(screen.getByLabelText("roic.ebit"), {
      target: { value: "1000000" },
    });
    fireEvent.change(screen.getByLabelText("roic.totalAssets"), {
      target: { value: "5000000" },
    });
    fireEvent.change(screen.getByLabelText("roic.currentLiabilities"), {
      target: { value: "1000000" },
    });
    fireEvent.change(screen.getByLabelText("roic.cash"), {
      target: { value: "500000" },
    });
    fireEvent.change(screen.getByLabelText("roic.netIncome"), {
      target: { value: "800000" },
    });
    fireEvent.change(screen.getByLabelText("roic.operatingCashFlow"), {
      target: { value: "900000" },
    });

    fireEvent.submit(screen.getByText("roic.analyze").closest("form")!);
    expect(onCalculate).toHaveBeenCalledWith(
      expect.objectContaining({
        ticker: "MEGA",
        ebit: 1000000,
        taxRate: 0.2,
      })
    );
  });
});

describe("RoicResultsView", () => {
  const mockResults = {
    nopat: 800000,
    investedCapital: 3500000,
    roic: 0.2286,
    sloanRatio: -0.125,
    fairEquityValue: 13333333,
    roicVsWacc: 0.1486,
    qualityRating: "Excellent" as const,
  };

  it("renders without crashing", () => {
    render(<RoicResultsView results={mockResults} />);
    expect(screen.getByText("roic.quality:")).toBeInTheDocument();
  });

  it("displays the quality rating badge", () => {
    render(<RoicResultsView results={mockResults} />);
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  it("renders all metric cards", () => {
    render(<RoicResultsView results={mockResults} />);
    expect(screen.getByText("roic.nopat")).toBeInTheDocument();
    expect(screen.getByText("roic.investedCapital")).toBeInTheDocument();
    expect(screen.getByText("roic.roicLabel")).toBeInTheDocument();
    expect(screen.getByText("roic.sloan")).toBeInTheDocument();
    expect(screen.getByText("roic.fairValue")).toBeInTheDocument();
    expect(screen.getByText("roic.roicVsWacc")).toBeInTheDocument();
  });

  it("shows Quality Earnings badge for negative sloan ratio", () => {
    render(<RoicResultsView results={mockResults} />);
    expect(screen.getByText("roic.qualityEarnings")).toBeInTheDocument();
  });
});

describe("RoicRankingTable", () => {
  const entries = [
    {
      ticker: "MEGA",
      name: "Mega Lifesciences",
      roicCurrent: 0.22,
      roicHistory: { "2024": 0.2, "2023": 0.18 },
      sloanRatio: -0.1,
      fairValue: 13000000,
      rating: "Excellent",
    },
    {
      ticker: "HMPRO",
      name: "Home Product Center",
      roicCurrent: 0.12,
      roicHistory: { "2024": 0.11, "2023": 0.1 },
      sloanRatio: 0.05,
      fairValue: 5000000,
      rating: "Good",
    },
  ];

  it("renders without crashing", () => {
    render(<RoicRankingTable entries={entries} />);
    expect(screen.getByText("roic.ranking")).toBeInTheDocument();
  });

  it("renders all stock entries", () => {
    render(<RoicRankingTable entries={entries} />);
    expect(screen.getByText("MEGA")).toBeInTheDocument();
    expect(screen.getByText("HMPRO")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<RoicRankingTable entries={entries} />);
    expect(screen.getByText(/roic.ticker/)).toBeInTheDocument();
    expect(screen.getByText(/roic.roicCurrent/)).toBeInTheDocument();
    expect(screen.getByText(/roic.quality/)).toBeInTheDocument();
  });

  it("displays history year columns", () => {
    render(<RoicRankingTable entries={entries} />);
    expect(screen.getByText("ROIC 2023")).toBeInTheDocument();
    expect(screen.getByText("ROIC 2024")).toBeInTheDocument();
  });
});

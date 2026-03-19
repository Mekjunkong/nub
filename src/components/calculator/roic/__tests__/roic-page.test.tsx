import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { RoicForm } from "../roic-form";
import { RoicResultsView } from "../roic-results";
import { RoicRankingTable } from "../roic-ranking-table";

describe("RoicForm", () => {
  it("renders without crashing", () => {
    render(<RoicForm onCalculate={() => {}} />);
    expect(screen.getByText("Financial Data")).toBeInTheDocument();
  });

  it("renders all input fields", () => {
    render(<RoicForm onCalculate={() => {}} />);
    expect(screen.getByLabelText("Ticker")).toBeInTheDocument();
    expect(screen.getByLabelText("EBIT")).toBeInTheDocument();
    expect(screen.getByLabelText("Tax Rate (%)")).toBeInTheDocument();
    expect(screen.getByLabelText("Total Assets")).toBeInTheDocument();
    expect(screen.getByLabelText("Current Liabilities")).toBeInTheDocument();
    expect(screen.getByLabelText("Cash & Equivalents")).toBeInTheDocument();
    expect(screen.getByLabelText("Net Income")).toBeInTheDocument();
    expect(screen.getByLabelText("Operating Cash Flow")).toBeInTheDocument();
    expect(screen.getByLabelText("WACC (%)")).toBeInTheDocument();
    expect(screen.getByLabelText("Growth Rate (%)")).toBeInTheDocument();
  });

  it("renders the Analyze submit button", () => {
    render(<RoicForm onCalculate={() => {}} />);
    expect(screen.getByText("Analyze")).toBeInTheDocument();
  });

  it("calls onCalculate when form is submitted with valid data", () => {
    const onCalculate = vi.fn();
    render(<RoicForm onCalculate={onCalculate} />);

    fireEvent.change(screen.getByLabelText("Ticker"), {
      target: { value: "MEGA" },
    });
    fireEvent.change(screen.getByLabelText("EBIT"), {
      target: { value: "1000000" },
    });
    fireEvent.change(screen.getByLabelText("Total Assets"), {
      target: { value: "5000000" },
    });
    fireEvent.change(screen.getByLabelText("Current Liabilities"), {
      target: { value: "1000000" },
    });
    fireEvent.change(screen.getByLabelText("Cash & Equivalents"), {
      target: { value: "500000" },
    });
    fireEvent.change(screen.getByLabelText("Net Income"), {
      target: { value: "800000" },
    });
    fireEvent.change(screen.getByLabelText("Operating Cash Flow"), {
      target: { value: "900000" },
    });

    fireEvent.submit(screen.getByText("Analyze").closest("form")!);
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
    qualityRating: "Excellent",
  };

  it("renders without crashing", () => {
    render(<RoicResultsView results={mockResults} />);
    expect(screen.getByText("Quality Rating:")).toBeInTheDocument();
  });

  it("displays the quality rating badge", () => {
    render(<RoicResultsView results={mockResults} />);
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  it("renders all metric cards", () => {
    render(<RoicResultsView results={mockResults} />);
    expect(screen.getByText("NOPAT")).toBeInTheDocument();
    expect(screen.getByText("Invested Capital")).toBeInTheDocument();
    expect(screen.getByText("ROIC")).toBeInTheDocument();
    expect(screen.getByText("Sloan Ratio")).toBeInTheDocument();
    expect(screen.getByText("Fair Equity Value")).toBeInTheDocument();
    expect(screen.getByText("ROIC vs WACC")).toBeInTheDocument();
  });

  it("shows Quality Earnings badge for negative sloan ratio", () => {
    render(<RoicResultsView results={mockResults} />);
    expect(screen.getByText("Quality Earnings")).toBeInTheDocument();
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
    expect(screen.getByText("Stock Ranking")).toBeInTheDocument();
  });

  it("renders all stock entries", () => {
    render(<RoicRankingTable entries={entries} />);
    expect(screen.getByText("MEGA")).toBeInTheDocument();
    expect(screen.getByText("HMPRO")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<RoicRankingTable entries={entries} />);
    expect(screen.getByText(/Ticker/)).toBeInTheDocument();
    expect(screen.getByText(/ROIC Current/)).toBeInTheDocument();
    expect(screen.getByText(/Rating/)).toBeInTheDocument();
  });

  it("displays history year columns", () => {
    render(<RoicRankingTable entries={entries} />);
    expect(screen.getByText("ROIC 2023")).toBeInTheDocument();
    expect(screen.getByText("ROIC 2024")).toBeInTheDocument();
  });
});

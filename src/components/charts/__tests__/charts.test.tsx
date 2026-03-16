import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock recharts to avoid SSR issues in test
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  Cell: () => <div />,
  ReferenceLine: () => <div />,
  ReferenceDot: () => <div />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
}));

import { WealthProjectionChart } from "../wealth-projection-chart";
import { SurvivalGauge } from "../survival-gauge";
import { HealthScoreGauge } from "../health-score-gauge";
import { EfficientFrontierChart } from "../efficient-frontier-chart";
import { ScenarioComparisonChart } from "../scenario-comparison-chart";
import { DcaComparisonChart } from "../dca-comparison-chart";
import { TimelineChart } from "../timeline-chart";
import { TaxComparisonChart } from "../tax-comparison-chart";

describe("WealthProjectionChart", () => {
  const mockData = {
    p10: [1000000, 900000, 800000],
    p25: [1000000, 950000, 900000],
    p50: [1000000, 1000000, 1000000],
    p75: [1000000, 1050000, 1100000],
    p90: [1000000, 1100000, 1200000],
  };

  it("renders with aria-label", () => {
    render(<WealthProjectionChart percentiles={mockData} />);
    expect(
      screen.getByLabelText("Wealth projection chart")
    ).toBeInTheDocument();
  });

  it("has accessible table fallback with sr-only class", () => {
    render(<WealthProjectionChart percentiles={mockData} />);
    const table = screen.getByRole("table");
    expect(table).toHaveClass("sr-only");
  });
});

describe("SurvivalGauge", () => {
  it("renders with rate and shows percentage text", () => {
    render(<SurvivalGauge rate={0.85} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("shows green color for rate > 80%", () => {
    render(<SurvivalGauge rate={0.85} />);
    expect(screen.getByTestId("survival-gauge")).toHaveAttribute(
      "data-color",
      "green"
    );
  });

  it("shows amber color for rate 50-80%", () => {
    render(<SurvivalGauge rate={0.65} />);
    expect(screen.getByTestId("survival-gauge")).toHaveAttribute(
      "data-color",
      "amber"
    );
  });

  it("shows red color for rate < 50%", () => {
    render(<SurvivalGauge rate={0.3} />);
    expect(screen.getByTestId("survival-gauge")).toHaveAttribute(
      "data-color",
      "red"
    );
  });
});

describe("HealthScoreGauge", () => {
  it("renders with score", () => {
    render(<HealthScoreGauge score={72} />);
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("shows On Track label for score 51-70", () => {
    render(<HealthScoreGauge score={65} />);
    expect(screen.getByText("On Track")).toBeInTheDocument();
  });

  it("shows Good label for score 71-85", () => {
    render(<HealthScoreGauge score={72} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });
});

describe("EfficientFrontierChart", () => {
  const mockFrontier = [
    { weights: [0.5, 0.5], expectedReturn: 0.05, risk: 0.1, sharpeRatio: 0.3 },
    { weights: [0.8, 0.2], expectedReturn: 0.08, risk: 0.15, sharpeRatio: 0.4 },
  ];
  const mockMaxSharpe = mockFrontier[1];
  const mockMinVol = mockFrontier[0];

  it("renders with aria-label", () => {
    render(
      <EfficientFrontierChart
        frontier={mockFrontier}
        maxSharpe={mockMaxSharpe}
        minVol={mockMinVol}
        assetNames={["Equity", "Bond"]}
      />
    );
    expect(
      screen.getByLabelText("Efficient frontier chart")
    ).toBeInTheDocument();
  });

  it("has accessible table fallback", () => {
    render(
      <EfficientFrontierChart
        frontier={mockFrontier}
        maxSharpe={mockMaxSharpe}
        minVol={mockMinVol}
        assetNames={["Equity", "Bond"]}
      />
    );
    expect(screen.getByRole("table")).toHaveClass("sr-only");
  });
});

describe("ScenarioComparisonChart", () => {
  const mockScenarios = [
    { name: "Normal", maxDrawdown: -0.1, finalWealth: 100000, recoveryTime: 5, equityCurve: [] },
    { name: "VaR (99%)", maxDrawdown: -0.2, finalWealth: 90000, recoveryTime: 10, equityCurve: [] },
    { name: "Black Swan", maxDrawdown: -0.4, finalWealth: 70000, recoveryTime: 20, equityCurve: [] },
    { name: "Combined", maxDrawdown: -0.5, finalWealth: 60000, recoveryTime: 25, equityCurve: [] },
  ];

  it("renders 4 scenario names", () => {
    render(<ScenarioComparisonChart scenarios={mockScenarios} />);
    expect(screen.getAllByText("Normal").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("VaR (99%)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Black Swan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Combined").length).toBeGreaterThanOrEqual(1);
  });

  it("has accessible table fallback", () => {
    render(<ScenarioComparisonChart scenarios={mockScenarios} />);
    expect(screen.getByRole("table")).toHaveClass("sr-only");
  });
});

describe("DcaComparisonChart", () => {
  const mockData = {
    static: [10000, 20500, 31200],
    glidepath: [10000, 20400, 31100],
    daa: [10000, 20600, 31400],
  };

  it("renders with 3 strategy labels", () => {
    render(<DcaComparisonChart data={mockData} />);
    expect(screen.getAllByText("Static").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Glidepath").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("DAA").length).toBeGreaterThanOrEqual(1);
  });

  it("has accessible table fallback", () => {
    render(<DcaComparisonChart data={mockData} />);
    expect(screen.getByRole("table")).toHaveClass("sr-only");
  });
});

describe("TimelineChart", () => {
  const mockData = [
    { year: 2026, age: 30, savings: 200000, milestone: null },
    { year: 2036, age: 40, savings: 1000000, milestone: "1M Baht" },
    { year: 2056, age: 60, savings: 5000000, milestone: "Retirement" },
  ];

  it("renders with year data", () => {
    render(<TimelineChart data={mockData} />);
    expect(screen.getByLabelText("Timeline chart")).toBeInTheDocument();
  });

  it("has accessible table fallback", () => {
    render(<TimelineChart data={mockData} />);
    expect(screen.getByRole("table")).toHaveClass("sr-only");
  });
});

describe("TaxComparisonChart", () => {
  it("renders before/after values", () => {
    render(
      <TaxComparisonChart
        currentTax={83000}
        optimizedTax={45000}
        taxSaved={38000}
      />
    );
    expect(screen.getAllByText(/83,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/45,000/).length).toBeGreaterThanOrEqual(1);
  });

  it("has accessible table fallback", () => {
    render(
      <TaxComparisonChart
        currentTax={83000}
        optimizedTax={45000}
        taxSaved={38000}
      />
    );
    expect(screen.getByRole("table")).toHaveClass("sr-only");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key, useLocale: () => "en" }));

import { GpfHoldingsForm } from "../gpf-holdings-form";

describe("GpfHoldingsForm", () => {
  const noop = () => {};

  it("renders without crashing", () => {
    render(<GpfHoldingsForm onOptimize={noop} computing={false} />);
    expect(screen.getByText("gpfOptimizer.currentHoldings")).toBeInTheDocument();
  });

  it("renders Bond Plan, Equity Plan, and Gold Plan inputs", () => {
    render(<GpfHoldingsForm onOptimize={noop} computing={false} />);
    expect(screen.getByLabelText("gpfOptimizer.bondPlan (THB)")).toBeInTheDocument();
    expect(
      screen.getByLabelText("gpfOptimizer.equityPlan (THB)")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("gpfOptimizer.goldPlan (THB)")).toBeInTheDocument();
  });

  it("renders contribution and horizon inputs", () => {
    render(<GpfHoldingsForm onOptimize={noop} computing={false} />);
    expect(
      screen.getByLabelText("gpfOptimizer.contribution (THB)")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("gpfOptimizer.horizon")
    ).toBeInTheDocument();
  });

  it("renders the Optimize Portfolio button", () => {
    render(<GpfHoldingsForm onOptimize={noop} computing={false} />);
    expect(screen.getByText("gpfOptimizer.optimize")).toBeInTheDocument();
  });

  it("shows asset assumptions with expected returns", () => {
    render(<GpfHoldingsForm onOptimize={noop} computing={false} />);
    expect(screen.getByText("gpfOptimizer.assetAssumptions")).toBeInTheDocument();
    expect(screen.getByText(/2\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/8\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/5\.0%/)).toBeInTheDocument();
  });
});

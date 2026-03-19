import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { GpfHoldingsForm } from "../gpf-holdings-form";

describe("GpfHoldingsForm", () => {
  const noop = () => {};

  it("renders without crashing", () => {
    render(<GpfHoldingsForm onOptimize={noop} computing={false} />);
    expect(screen.getByText("GPF Holdings")).toBeInTheDocument();
  });

  it("renders Bond Plan, Equity Plan, and Gold Plan inputs", () => {
    render(<GpfHoldingsForm onOptimize={noop} computing={false} />);
    expect(screen.getByLabelText("Bond Plan (THB)")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Foreign Equity Plan (THB)")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Gold Plan (THB)")).toBeInTheDocument();
  });

  it("renders contribution and horizon inputs", () => {
    render(<GpfHoldingsForm onOptimize={noop} computing={false} />);
    expect(
      screen.getByLabelText("Monthly Contribution (THB)")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Investment Horizon (Years)")
    ).toBeInTheDocument();
  });

  it("renders the Optimize Portfolio button", () => {
    render(<GpfHoldingsForm onOptimize={noop} computing={false} />);
    expect(screen.getByText("Optimize Portfolio")).toBeInTheDocument();
  });

  it("shows asset assumptions with expected returns", () => {
    render(<GpfHoldingsForm onOptimize={noop} computing={false} />);
    expect(screen.getByText("Asset Assumptions")).toBeInTheDocument();
    expect(screen.getByText(/2\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/8\.0%/)).toBeInTheDocument();
    expect(screen.getByText(/5\.0%/)).toBeInTheDocument();
  });
});

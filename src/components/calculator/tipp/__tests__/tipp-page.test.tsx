import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { TippForm } from "../tipp-form";

describe("TippForm", () => {
  const noop = () => {};

  it("renders without crashing", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    expect(
      screen.getByLabelText("Initial Capital (THB)")
    ).toBeInTheDocument();
  });

  it("renders the Initial Capital input", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    const input = screen.getByLabelText("Initial Capital (THB)");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(1000000);
  });

  it("renders the Floor Protection slider", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    expect(screen.getByLabelText("Floor Protection")).toBeInTheDocument();
  });

  it("renders the Max Multiplier slider", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    expect(screen.getByLabelText("Max Multiplier")).toBeInTheDocument();
  });

  it("renders additional parameter inputs", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    expect(
      screen.getByLabelText("Target Volatility (%)")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Simulation Months")).toBeInTheDocument();
  });

  it("renders the Run Simulation button", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    expect(screen.getByText("Run Simulation")).toBeInTheDocument();
  });
});

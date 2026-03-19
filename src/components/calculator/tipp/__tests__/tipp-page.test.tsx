import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key, useLocale: () => "en" }));

import { TippForm } from "../tipp-form";

describe("TippForm", () => {
  const noop = () => {};

  it("renders without crashing", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    expect(
      screen.getByLabelText("tipp.initialCapital (THB)")
    ).toBeInTheDocument();
  });

  it("renders the Initial Capital input", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    const input = screen.getByLabelText("tipp.initialCapital (THB)");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(1000000);
  });

  it("renders the Floor Protection slider", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    expect(screen.getByLabelText("tipp.floor")).toBeInTheDocument();
  });

  it("renders the Max Multiplier slider", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    expect(screen.getByLabelText("tipp.multiplier")).toBeInTheDocument();
  });

  it("renders additional parameter inputs", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    expect(
      screen.getByLabelText("tipp.volatility")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("tipp.simulationMonths")).toBeInTheDocument();
  });

  it("renders the Run Simulation button", () => {
    render(<TippForm onSimulate={noop} computing={false} />);
    expect(screen.getByText("tipp.simulate")).toBeInTheDocument();
  });
});

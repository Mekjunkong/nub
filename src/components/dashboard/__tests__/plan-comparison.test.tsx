import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlanComparison } from "../plan-comparison";

vi.mock("next-intl", () => ({ useLocale: () => "en" }));

describe("PlanComparison", () => {
  it("shows message when fewer than 2 plans selected", () => {
    render(<PlanComparison plans={[]} />);
    expect(screen.getByText(/Select 2 plans/i)).toBeInTheDocument();
  });

  it("renders two plans side by side", () => {
    const plans = [
      { id: "1", name: "Plan A", plan_type: "retirement" as const, results: { healthScore: 65, gap: 2000000 } },
      { id: "2", name: "Plan B", plan_type: "retirement" as const, results: { healthScore: 80, gap: 500000 } },
    ];
    render(<PlanComparison plans={plans} />);
    expect(screen.getByText("Plan A")).toBeInTheDocument();
    expect(screen.getByText("Plan B")).toBeInTheDocument();
  });

  it("highlights better values in green", () => {
    const plans = [
      { id: "1", name: "Plan A", plan_type: "retirement" as const, results: { healthScore: 65, gap: 2000000 } },
      { id: "2", name: "Plan B", plan_type: "retirement" as const, results: { healthScore: 80, gap: 500000 } },
    ];
    render(<PlanComparison plans={plans} />);
    // Plan B has better score (80 > 65) and lower gap - should show highlighted
    const planBScore = screen.getByTestId("plan-1-healthScore");
    expect(planBScore.className).toContain("text-success");
  });
});

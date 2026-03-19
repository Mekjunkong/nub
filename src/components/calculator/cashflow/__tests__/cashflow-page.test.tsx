import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next-intl
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key, useLocale: () => "en" }));

// Mock recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

import { CashflowTemplateForm } from "../cashflow-template-form";
import { CashflowMonthView } from "../cashflow-month-view";
import { CashflowResultsView } from "../cashflow-results";

describe("CashflowTemplateForm", () => {
  const noop = () => {};

  it("renders without crashing", () => {
    render(
      <CashflowTemplateForm templates={[]} onAdd={noop} onDelete={noop} />
    );
    expect(screen.getByTestId("cashflow-templates")).toBeInTheDocument();
  });

  it("renders the card title", () => {
    render(
      <CashflowTemplateForm templates={[]} onAdd={noop} onDelete={noop} />
    );
    expect(screen.getByText("cashflow.templates")).toBeInTheDocument();
  });

  it("shows add button when form is hidden", () => {
    render(
      <CashflowTemplateForm templates={[]} onAdd={noop} onDelete={noop} />
    );
    expect(screen.getByText("cashflow.addTemplate")).toBeInTheDocument();
  });

  it("renders existing templates in a table", () => {
    const templates = [
      {
        id: "1",
        name: "Monthly Salary",
        direction: "income" as const,
        category: "salary" as const,
        amount: 50000,
        isActive: true,
      },
    ];
    render(
      <CashflowTemplateForm
        templates={templates}
        onAdd={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText("Monthly Salary")).toBeInTheDocument();
    expect(screen.getByText(/50,000/)).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDelete = vi.fn();
    const templates = [
      {
        id: "t1",
        name: "Test",
        direction: "expense" as const,
        category: "personal" as const,
        amount: 1000,
        isActive: true,
      },
    ];
    render(
      <CashflowTemplateForm
        templates={templates}
        onAdd={noop}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByText("delete"));
    expect(onDelete).toHaveBeenCalledWith("t1");
  });
});

describe("CashflowMonthView", () => {
  const noop = () => {};

  it("renders without crashing", () => {
    render(
      <CashflowMonthView
        transactions={[]}
        month={3}
        year={2026}
        onMonthChange={noop}
        onYearChange={noop}
        onAdd={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByTestId("cashflow-month-view")).toBeInTheDocument();
  });

  it("displays the current month and year", () => {
    render(
      <CashflowMonthView
        transactions={[]}
        month={3}
        year={2026}
        onMonthChange={noop}
        onYearChange={noop}
        onAdd={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText("March 2026")).toBeInTheDocument();
  });

  it("renders the card title", () => {
    render(
      <CashflowMonthView
        transactions={[]}
        month={1}
        year={2026}
        onMonthChange={noop}
        onYearChange={noop}
        onAdd={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText("cashflow.monthlyTransactions")).toBeInTheDocument();
  });

  it("shows empty state when no transactions", () => {
    render(
      <CashflowMonthView
        transactions={[]}
        month={1}
        year={2026}
        onMonthChange={noop}
        onYearChange={noop}
        onAdd={noop}
        onDelete={noop}
      />
    );
    expect(
      screen.getByText("cashflow.noTransactions")
    ).toBeInTheDocument();
  });

  it("renders transactions grouped by section", () => {
    const transactions = [
      {
        id: "1",
        templateId: null,
        direction: "income" as const,
        category: "salary" as const,
        name: "Monthly Pay",
        amount: 50000,
        month: 3,
        year: 2026,
      },
    ];
    render(
      <CashflowMonthView
        transactions={transactions}
        month={3}
        year={2026}
        onMonthChange={noop}
        onYearChange={noop}
        onAdd={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText("Monthly Pay")).toBeInTheDocument();
    expect(screen.getByText("cashflow.income")).toBeInTheDocument();
  });
});

describe("CashflowResultsView", () => {
  const mockResults = {
    totalIncome: 80000,
    totalExpenses: 40000,
    totalSavingsInvestment: 20000,
    totalOutflow: 60000,
    netCashflow: 20000,
    savingsInvestmentRatio: 0.25,
    debtServiceRatio: 0.1,
    insuranceRiskRatio: 0.05,
    taxDeductibleTotal: 10000,
    lifestyleBreakdown: {
      personal: 15000,
      family: 0,
      transport: 10000,
      education: 0,
      travel: 0,
      housing: 15000,
      other: 0,
    },
  };

  it("renders summary metric cards", () => {
    render(<CashflowResultsView results={mockResults} />);
    expect(screen.getByText("cashflow.totalIncome")).toBeInTheDocument();
    expect(screen.getByText("cashflow.totalExpenses")).toBeInTheDocument();
    expect(screen.getByText("cashflow.netCashflow")).toBeInTheDocument();
  });

  it("renders ratio cards", () => {
    render(<CashflowResultsView results={mockResults} />);
    expect(
      screen.getByText("cashflow.savingsRatio")
    ).toBeInTheDocument();
    expect(screen.getByText("cashflow.debtRatio")).toBeInTheDocument();
  });

  it("renders lifestyle breakdown chart", () => {
    render(<CashflowResultsView results={mockResults} />);
    expect(screen.getByText("cashflow.lifestyle")).toBeInTheDocument();
  });
});

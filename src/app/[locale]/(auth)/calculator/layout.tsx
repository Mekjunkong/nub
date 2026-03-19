import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Nub Calculator",
    default: "Calculator | Nub",
  },
  description: "AI-powered financial calculators for retirement planning, portfolio optimization, and tax strategy",
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

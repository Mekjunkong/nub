import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tax Optimizer",
  description: "Optimize your Thai tax deductions with SSF, RMF, and insurance allowances",
};

export default function TaxLayout({ children }: { children: React.ReactNode }) {
  return children;
}

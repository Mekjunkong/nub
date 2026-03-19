import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retirement Planner",
  description: "Analyze your retirement gap and plan for a secure future with government, private, or freelance scenarios",
};

export default function RetirementLayout({ children }: { children: React.ReactNode }) {
  return children;
}

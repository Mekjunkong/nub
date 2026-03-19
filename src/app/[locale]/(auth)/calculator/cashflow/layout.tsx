import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cashflow Tracker",
  description: "Track income, expenses, savings, and investments to monitor your financial health",
};

export default function CashflowLayout({ children }: { children: React.ReactNode }) {
  return children;
}

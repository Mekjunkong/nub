import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DCA Tracker",
  description: "Compare dollar-cost averaging strategies with historical data and backtest results",
};

export default function DcaLayout({ children }: { children: React.ReactNode }) {
  return children;
}

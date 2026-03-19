import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdrawal Simulator",
  description: "Simulate retirement withdrawals with Monte Carlo analysis to find your safe withdrawal rate",
};

export default function WithdrawalLayout({ children }: { children: React.ReactNode }) {
  return children;
}

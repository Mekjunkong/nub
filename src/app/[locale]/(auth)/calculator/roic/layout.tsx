import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROIC Analyzer",
  description: "Analyze stock Return on Invested Capital with intrinsic value estimation",
};

export default function RoicLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MPT Optimizer",
  description: "Optimize your portfolio allocation with Modern Portfolio Theory and efficient frontier analysis",
};

export default function MptLayout({ children }: { children: React.ReactNode }) {
  return children;
}

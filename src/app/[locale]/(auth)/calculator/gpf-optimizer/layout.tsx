import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GPF Optimizer",
  description: "Optimize your Government Pension Fund allocation across bond, equity, and gold plans",
};

export default function GpfOptimizerLayout({ children }: { children: React.ReactNode }) {
  return children;
}

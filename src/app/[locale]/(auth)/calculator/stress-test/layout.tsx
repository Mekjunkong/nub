import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stress Test",
  description: "Test your portfolio under crisis scenarios including black swan events and market downturns",
};

export default function StressTestLayout({ children }: { children: React.ReactNode }) {
  return children;
}

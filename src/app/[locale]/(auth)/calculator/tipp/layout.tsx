import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TIPP/VPPI",
  description: "Dynamic portfolio protection strategy with time-invariant portfolio protection simulation",
};

export default function TippLayout({ children }: { children: React.ReactNode }) {
  return children;
}

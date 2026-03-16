// Root layout - minimal pass-through since [locale]/layout.tsx handles everything
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { AuthLayout } from "@/components/layout/auth-layout";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AuthLayout>
  );
}

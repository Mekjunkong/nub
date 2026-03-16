"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { track } from "@/lib/analytics";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    track("error_boundary_caught", {
      error: error.message,
      stack: error.stack?.slice(0, 500),
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Card className="mx-auto max-w-md mt-12">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-warning" />
            <h2 className="text-lg font-semibold text-text">Something went wrong</h2>
            <p className="text-sm text-text-muted">
              An unexpected error occurred. Please try again.
            </p>
            {this.state.error && (
              <code className="text-xs text-danger bg-surface-hover rounded p-2 max-w-full overflow-auto">
                {this.state.error.message}
              </code>
            )}
            <Button onClick={this.handleRetry}>Try Again</Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

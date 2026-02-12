"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Section Error Boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default Error UI
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/10">
          <div className="flex flex-col items-center justify-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-red-900 dark:text-red-200">
              Something went wrong
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300 max-w-md mx-auto mb-4">
              {this.state.error?.message || "We couldn't load this section."}
            </p>
            <Button
              variant="outline"
              className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/20"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

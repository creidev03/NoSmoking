"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white p-8 text-center dark:border-[#374151] dark:bg-[#1F2937]">
          <div className="mb-4 text-4xl">😵</div>
          <h3 className="mb-2 text-lg font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
            Algo salió mal
          </h3>
          <p className="mb-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            {this.state.error?.message || "Ocurrió un error inesperado"}
          </p>
          <button
            onClick={this.handleReset}
            className="rounded-lg bg-[#10B981] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#059669]"
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

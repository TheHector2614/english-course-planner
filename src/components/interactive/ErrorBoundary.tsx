import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-incorrect/20 bg-incorrect-bg p-6 text-center max-w-md mx-auto my-8 shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-incorrect/10 text-incorrect">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text">{this.props.fallbackTitle || "Something went wrong"}</h3>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            An error occurred while loading this interactive section. This can happen if database access is blocked.
          </p>
          {this.state.error && (
            <pre className="mt-3 overflow-x-auto rounded bg-surface p-2.5 text-left text-xs font-mono text-text-muted leading-normal max-h-32 border border-border">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="mt-4 inline-flex items-center justify-center min-h-11 rounded-lg bg-text px-5 py-2 text-sm font-semibold text-surface transition-all hover:opacity-90 active-scale"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}


import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch and handle runtime errors in the component tree.
 * Inherits from Component to properly use 'setState' and 'props'.
 */
class ErrorBoundary extends Component<Props, State> {
  // Initialize state; using public field is standard for modern React class components
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  // Use ErrorInfo for proper type matching in componentDidCatch
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Fix: setState is inherited from Component, ensuring TypeScript recognizes it.
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error is caught.
      return (
        <div className="min-h-screen bg-gray-900 text-red-400 flex flex-col items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-500/50 p-8 rounded-lg max-w-2xl w-full">
            <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
            <p className="text-gray-300 mb-6">
              The application encountered a critical error and could not continue. 
              Please try reloading the page. If the problem persists, check the browser console for more details.
            </p>
            <details className="bg-gray-900 p-4 rounded-md">
              <summary className="cursor-pointer font-mono text-sm text-gray-400">Error Details</summary>
              <pre className="mt-4 text-xs whitespace-pre-wrap break-all">
                {this.state.error?.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    // Fix: Access children from the inherited props property.
    return this.props.children;
  }
}

export default ErrorBoundary;

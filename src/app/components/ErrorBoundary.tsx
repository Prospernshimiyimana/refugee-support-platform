'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; errorInfo?: React.ErrorInfo; reset: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // You could integrate with error reporting services like Sentry here
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
    
    this.setState({ error, errorInfo });
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} errorInfo={this.state.errorInfo} reset={this.reset} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, errorInfo, reset }: { 
  error?: Error; 
  errorInfo?: React.ErrorInfo; 
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 mb-6">
          We&apos;re sorry, but something unexpected happened. The error has been logged and our team will look into it.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go Home
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Error Details (Development Only)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto">
              <div className="font-semibold mb-1">Error:</div>
              <div className="mb-2">{error.message}</div>
              <div className="font-semibold mb-1">Stack:</div>
              <pre className="whitespace-pre-wrap">{error.stack}</pre>
              {errorInfo && (
                <>
                  <div className="font-semibold mb-1 mt-2">Component Stack:</div>
                  <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                </>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

export default ErrorBoundary;

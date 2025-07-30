'use client';

import React from 'react';
import { log } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void; errorId?: string }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

const DefaultErrorFallback = ({ 
  error, 
  reset, 
  errorId 
}: { 
  error: Error; 
  reset: () => void; 
  errorId?: string; 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-black text-white">
    <div className="max-w-md mx-auto text-center p-6">
      <div className="mb-6">
        <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-4">
        Something went wrong
      </h2>
      <p className="text-gray-400 mb-6">
        {error.message || 'An unexpected error occurred while loading the gallery.'}
      </p>
      {errorId && (
        <p className="text-xs text-gray-500 mb-4">
          Error ID: {errorId}
        </p>
      )}
      <div className="space-y-3">
        <button
          onClick={reset}
          className="w-full bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-gray-800 text-white px-4 py-2 rounded-full font-medium hover:bg-gray-700 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  </div>
);

// Generate unique error ID for tracking
const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = generateErrorId();
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { errorId } = this.state;
    
    // Enhanced logging with context
    log.error('React Error Boundary caught error', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      errorId,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    });

    // Call external error handler if provided
    this.props.onError?.(error, errorInfo);

    // Send to external logging service (if configured)
    this.sendToExternalLogger(error, errorInfo, errorId);
  }

  private sendToExternalLogger = (error: Error, errorInfo: React.ErrorInfo, errorId?: string) => {
    // Integration point for external logging services
    if (typeof window !== 'undefined') {
      // Example: Sentry integration
      // Sentry.captureException(error, {
      //   tags: { errorId, component: 'ErrorBoundary' },
      //   extra: errorInfo,
      // });

      // Example: LogRocket integration
      // LogRocket.captureException(error);

      // Example: Datadog integration
      // DD_RUM.addError(error, { errorId, ...errorInfo });

      // Custom analytics tracking
      const windowWithGtag = window as Window & typeof globalThis & {
        gtag?: (command: string, eventName: string, parameters: Record<string, unknown>) => void;
      };
      
      if (windowWithGtag.gtag) {
        windowWithGtag.gtag('event', 'exception', {
          description: error.message,
          fatal: false,
          error_id: errorId,
        });
      }
    }
  };

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return (
        <Fallback
          error={this.state.error}
          reset={this.reset}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

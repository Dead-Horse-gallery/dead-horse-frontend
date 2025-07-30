import React, { Suspense } from 'react';
import { Skeleton } from './Skeleton';
import { logger } from '@/lib/logger';

interface LoadingWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
  minLoadingTime?: number;
}

/**
 * Higher-order component for handling loading states with skeletons
 * Provides consistent loading experience across the application
 */
export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  children,
  fallback,
  name = 'Component',
  minLoadingTime = 0,
}) => {
  const defaultFallback = (
    <div className="space-y-4">
      <Skeleton height="2rem" width="200px" />
      <Skeleton height="1rem" width="100%" />
      <Skeleton height="1rem" width="90%" />
      <Skeleton height="1rem" width="80%" />
    </div>
  );

  return (
    <Suspense 
      fallback={
        <LoadingFallback 
          fallback={fallback || defaultFallback}
          name={name}
          minLoadingTime={minLoadingTime}
        />
      }
    >
      {children}
    </Suspense>
  );
};

interface LoadingFallbackProps {
  fallback: React.ReactNode;
  name: string;
  minLoadingTime: number;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  fallback,
  name,
  minLoadingTime,
}) => {
  const [showFallback, setShowFallback] = React.useState(minLoadingTime === 0);

  React.useEffect(() => {
    if (minLoadingTime > 0) {
      const timer = setTimeout(() => {
        setShowFallback(true);
      }, minLoadingTime);

      return () => clearTimeout(timer);
    }
  }, [minLoadingTime]);

  React.useEffect(() => {
    logger.debug(`Loading component: ${name}`);
  }, [name]);

  if (!showFallback) {
    return null;
  }

  return (
    <div role="status" aria-label={`Loading ${name}`}>
      {fallback}
      <span className="sr-only">Loading {name}...</span>
    </div>
  );
};

/**
 * Hook for managing loading states with performance tracking
 */
export const useLoadingState = (name: string) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const startTimeRef = React.useRef<number>(0);

  const startLoading = React.useCallback(() => {
    startTimeRef.current = performance.now();
    setIsLoading(true);
    setError(null);
    logger.debug(`Started loading: ${name}`);
  }, [name]);

  const stopLoading = React.useCallback(() => {
    const loadTime = performance.now() - startTimeRef.current;
    setIsLoading(false);
    logger.info(`Finished loading: ${name}`, { loadTime: `${loadTime.toFixed(2)}ms` });
  }, [name]);

  const setLoadingError = React.useCallback((err: Error) => {
    const loadTime = performance.now() - startTimeRef.current;
    setIsLoading(false);
    setError(err);
    logger.error(`Error loading: ${name}`, { error: err.message, loadTime: `${loadTime.toFixed(2)}ms` });
  }, [name]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setLoadingError,
  };
};

/**
 * Component for showing loading progress
 */
interface LoadingProgressProps {
  progress?: number;
  message?: string;
  className?: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress = 0,
  message = 'Loading...',
  className = '',
}) => (
  <div className={`flex flex-col items-center space-y-4 ${className}`}>
    <div className="w-full max-w-md">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{message}</span>
        {progress > 0 && <span>{Math.round(progress)}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  </div>
);

/**
 * HOC for adding loading states to components
 */
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent?: React.ComponentType
) {
  const WrappedComponent = (props: P & { loading?: boolean }) => {
    const { loading, ...restProps } = props;

    if (loading) {
      return LoadingComponent ? <LoadingComponent /> : <Skeleton height="200px" />;
    }

    return <Component {...(restProps as P)} />;
  };

  WrappedComponent.displayName = `withLoading(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default LoadingWrapper;

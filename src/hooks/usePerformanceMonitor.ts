'use client';

import { useEffect, useRef, useCallback } from 'react';
import { log } from '@/lib/logger';

interface UsePerformanceMonitorOptions {
  name: string;
  autoStart?: boolean;
  metadata?: Record<string, unknown>;
}

export function usePerformanceMonitor({ 
  name, 
  autoStart = false, 
  metadata 
}: UsePerformanceMonitorOptions) {
  const isRunningRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (isRunningRef.current) {
      log.warn(`Performance monitor "${name}" is already running`);
      return;
    }
    
    isRunningRef.current = true;
    startTimeRef.current = performance.now();
    log.startPerformanceMark(name);
  }, [name]);

  const end = useCallback(() => {
    if (!isRunningRef.current) {
      log.warn(`Performance monitor "${name}" is not running`);
      return null;
    }
    
    isRunningRef.current = false;
    const result = log.endPerformanceMark(name, metadata);
    startTimeRef.current = null;
    return result;
  }, [name, metadata]);

  const restart = useCallback(() => {
    if (isRunningRef.current) {
      end();
    }
    start();
  }, [start, end]);

  // Auto-start on mount if requested
  useEffect(() => {
    if (autoStart) {
      start();
    }
    
    // Auto-end on unmount if still running
    return () => {
      if (isRunningRef.current) {
        end();
      }
    };
  }, [autoStart, start, end]);

  return {
    start,
    end,
    restart,
    isRunning: isRunningRef.current,
    duration: startTimeRef.current ? performance.now() - startTimeRef.current : null,
  };
}

// Hook for tracking page load performance
export function usePageLoadPerformance(pageName: string) {
  useEffect(() => {
    // Track page load performance
    const startTime = performance.now();
    
    // Track when the page is fully loaded
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      log.trackPageLoad(pageName, loadTime);
    };

    // If document is already loaded, track immediately
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [pageName]);
}

// Hook for tracking user interactions
export function useUserActionTracker() {
  const trackClick = useCallback((element: string, metadata?: Record<string, unknown>) => {
    log.userAction('click', {
      element,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const trackFormSubmit = useCallback((formName: string, metadata?: Record<string, unknown>) => {
    log.userAction('form_submit', {
      form: formName,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const trackNavigation = useCallback((from: string, to: string, metadata?: Record<string, unknown>) => {
    log.userAction('navigation', {
      from,
      to,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const trackError = useCallback((error: string, metadata?: Record<string, unknown>) => {
    log.error('User encountered error', {
      error,
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return {
    trackClick,
    trackFormSubmit,
    trackNavigation,
    trackError,
  };
}

"use client";

import { useEffect, useState, useCallback } from 'react';
import { useHybridAuth } from '@/contexts/HybridAuthContext';
import { 
  getSessionManager, 
  resetGlobalSession, 
  SessionManager, 
  SensitiveAction,
  SENSITIVE_ACTIONS 
} from '@/lib/session';
import { logger } from '@/lib/logger';

export interface UseSessionOptions {
  /** Show warning before session expires */
  enableWarnings?: boolean;
  /** Auto-logout on session expiry */
  autoLogout?: boolean;
  /** Monitor session in background */
  enableMonitoring?: boolean;
}

export interface SessionStatus {
  isValid: boolean;
  canPerformSensitive: boolean;
  timeUntilExpiry: number;
  timeUntilSensitiveExpiry: number;
  showWarning: boolean;
  sessionInfo: ReturnType<SessionManager['getSessionInfo']>;
}

export function useSession(options: UseSessionOptions = {}) {
  const {
    enableWarnings = true,
    autoLogout = true,
    enableMonitoring = true
  } = options;

  const { logout, isAuthenticated } = useHybridAuth();
  const [sessionManager] = useState(() => getSessionManager());
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isValid: true,
    canPerformSensitive: false,
    timeUntilExpiry: 0,
    timeUntilSensitiveExpiry: 0,
    showWarning: false,
    sessionInfo: sessionManager.getSessionInfo()
  });

  // Update session status
  const updateSessionStatus = useCallback(() => {
    const status: SessionStatus = {
      isValid: sessionManager.isSessionValid(),
      canPerformSensitive: sessionManager.canPerformSensitiveAction(),
      timeUntilExpiry: sessionManager.getTimeUntilExpiry(),
      timeUntilSensitiveExpiry: sessionManager.getTimeUntilSensitiveExpiry(),
      showWarning: sessionManager.shouldShowWarning(),
      sessionInfo: sessionManager.getSessionInfo()
    };
    setSessionStatus(status);
    return status;
  }, [sessionManager]);

  // Handle session expiry
  const handleSessionExpired = useCallback(() => {
    logger.warn('Session expired, logging out user');
    if (autoLogout && isAuthenticated) {
      logout();
      resetGlobalSession();
    }
  }, [autoLogout, isAuthenticated, logout]);

  // Handle timeout warning
  const handleTimeoutWarning = useCallback(() => {
    if (enableWarnings) {
      setShowTimeoutWarning(true);
      logger.info('Session timeout warning displayed');
    }
  }, [enableWarnings]);

  // Update activity on user interaction
  const updateActivity = useCallback(() => {
    sessionManager.updateActivity();
    setShowTimeoutWarning(false);
    updateSessionStatus();
    logger.debug('Session activity updated from user interaction');
  }, [sessionManager, updateSessionStatus]);

  // Mark sensitive authentication
  const markSensitiveAuth = useCallback(() => {
    sessionManager.markSensitiveAuth();
    updateSessionStatus();
    logger.info('Sensitive authentication marked');
  }, [sessionManager, updateSessionStatus]);

  // Check if sensitive action is allowed
  const checkSensitiveAction = useCallback((action: SensitiveAction): boolean => {
    const canPerform = sessionManager.canPerformSensitiveAction();
    if (!canPerform) {
      logger.warn('Sensitive action blocked', { action });
    }
    return canPerform;
  }, [sessionManager]);

  // Extend session
  const extendSession = useCallback(() => {
    sessionManager.extendSession();
    setShowTimeoutWarning(false);
    updateSessionStatus();
    logger.info('Session extended by user');
  }, [sessionManager, updateSessionStatus]);

  // Dismiss timeout warning
  const dismissWarning = useCallback(() => {
    setShowTimeoutWarning(false);
    logger.debug('Timeout warning dismissed');
  }, []);

  // Set up session monitoring
  useEffect(() => {
    if (!enableMonitoring || !isAuthenticated) return;

    // Set up callbacks
    sessionManager.onSessionExpired(handleSessionExpired);
    sessionManager.onTimeoutWarning(handleTimeoutWarning);

    // Start monitoring
    const stopMonitoring = sessionManager.startMonitoring();

    // Update status immediately
    updateSessionStatus();

    return stopMonitoring;
  }, [
    enableMonitoring, 
    isAuthenticated, 
    sessionManager, 
    handleSessionExpired, 
    handleTimeoutWarning,
    updateSessionStatus
  ]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const throttledUpdateActivity = (() => {
      let lastUpdate = 0;
      return () => {
        const now = Date.now();
        if (now - lastUpdate > 30000) { // Throttle to once per 30 seconds
          updateActivity();
          lastUpdate = now;
        }
      };
    })();

    events.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity);
      });
    };
  }, [isAuthenticated, updateActivity]);

  // Reset session on logout
  useEffect(() => {
    if (!isAuthenticated) {
      resetGlobalSession();
      setShowTimeoutWarning(false);
      updateSessionStatus();
    }
  }, [isAuthenticated, updateSessionStatus]);

  return {
    // Session status
    ...sessionStatus,
    showTimeoutWarning,
    
    // Actions
    updateActivity,
    markSensitiveAuth,
    checkSensitiveAction,
    extendSession,
    dismissWarning,
    
    // Utilities
    formatTimeRemaining: (ms: number) => {
      const minutes = Math.ceil(ms / (60 * 1000));
      if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    },
    
    // Constants
    SENSITIVE_ACTIONS
  };
}

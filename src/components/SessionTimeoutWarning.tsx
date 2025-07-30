"use client";

import React from 'react';
import { useSession } from '@/hooks/useSession';
import { logger } from '@/lib/logger';

interface SessionTimeoutWarningProps {
  /** Custom title for the warning */
  title?: string;
  /** Custom message for the warning */
  message?: string;
  /** Show compact version */
  compact?: boolean;
  /** Custom styling */
  className?: string;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  title = "Session Expiring Soon",
  message = "Your session will expire soon. Extend your session to stay logged in.",
  compact = false,
  className = ""
}) => {
  const {
    showTimeoutWarning,
    timeUntilExpiry,
    extendSession,
    dismissWarning,
    formatTimeRemaining
  } = useSession();

  if (!showTimeoutWarning) return null;

  const handleExtend = () => {
    extendSession();
    logger.info('User extended session from timeout warning');
  };

  const handleDismiss = () => {
    dismissWarning();
    logger.info('User dismissed timeout warning');
  };

  if (compact) {
    return (
      <div className={`fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded shadow-lg z-50 max-w-sm ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">
                Session expires in {formatTimeRemaining(timeUntilExpiry)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleExtend}
              className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
            >
              Extend
            </button>
            <button
              onClick={handleDismiss}
              className="text-yellow-500 hover:text-yellow-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{message}</p>
                <p className="text-sm font-medium text-yellow-600 mt-1">
                  Time remaining: {formatTimeRemaining(timeUntilExpiry)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleExtend}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
          >
            Extend Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;

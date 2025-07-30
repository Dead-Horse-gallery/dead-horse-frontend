/**
 * Accessibility Settings Panel component
 * Provides user interface for managing accessibility preferences
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import AccessibleButton from './AccessibleButton';
import AccessibleModal from './AccessibleModal';

interface AccessibilityPanelProps {
  className?: string;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting, runAudit, auditResult, isAuditing } = useAccessibility();

  const handleAuditClick = async () => {
    await runAudit();
  };

  const settingsOptions = [
    {
      key: 'reducedMotion' as const,
      label: 'Reduced Motion',
      description: 'Minimize animations and transitions for a calmer experience',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      key: 'highContrast' as const,
      label: 'High Contrast',
      description: 'Increase color contrast for better text readability',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      key: 'focusVisible' as const,
      label: 'Enhanced Focus',
      description: 'Show clear focus indicators for keyboard navigation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      key: 'announcements' as const,
      label: 'Screen Reader Announcements',
      description: 'Enable helpful announcements for screen reader users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      key: 'keyboardNavigation' as const,
      label: 'Keyboard Shortcuts',
      description: 'Enable accessibility keyboard shortcuts (Alt+Shift+Key)',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <AccessibleButton
          onClick={() => setIsOpen(true)}
          className={cn(
            'rounded-full w-14 h-14 shadow-lg hover:shadow-xl',
            'bg-blue-600 text-white hover:bg-blue-700',
            className
          )}
          aria-label="Open accessibility settings"
          title="Accessibility Settings"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </AccessibleButton>
      </div>

      {/* Settings Modal */}
      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Accessibility Settings"
        description="Customize your accessibility preferences for a better browsing experience"
        size="lg"
      >
        <div className="space-y-6">
          {/* Settings List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Accessibility Preferences
            </h3>
            
            <div className="space-y-3">
              {settingsOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-shrink-0 mt-0.5 text-blue-600">
                    {option.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <label
                          htmlFor={option.key}
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {option.label}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          {option.description}
                        </p>
                      </div>
                      
                      <div className="ml-4">
                        <button
                          id={option.key}
                          type="button"
                          role="switch"
                          aria-checked={settings[option.key]}
                          onClick={() => updateSetting(option.key, !settings[option.key])}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                            settings[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                          )}
                          aria-describedby={`${option.key}-description`}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                              settings[option.key] ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          {settings.keyboardNavigation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Keyboard Shortcuts
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Alt+Shift+A</kbd> Toggle announcements</div>
                <div><kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Alt+Shift+M</kbd> Toggle reduced motion</div>
                <div><kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Alt+Shift+C</kbd> Toggle high contrast</div>
                <div><kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Alt+Shift+F</kbd> Toggle focus indicators</div>
              </div>
            </div>
          )}

          {/* Accessibility Audit Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Accessibility Audit
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Check this page for accessibility issues and compliance
                </p>
              </div>
              
              <AccessibleButton
                onClick={handleAuditClick}
                loading={isAuditing}
                loadingText="Auditing..."
                disabled={isAuditing}
                className="ml-4"
              >
                Run Audit
              </AccessibleButton>
            </div>

            {auditResult && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      'text-2xl font-bold',
                      getScoreColor(auditResult.score)
                    )}>
                      {auditResult.score}/100
                    </span>
                    <span className={cn(
                      'text-sm font-medium',
                      getScoreColor(auditResult.score)
                    )}>
                      {getScoreLabel(auditResult.score)}
                    </span>
                  </div>
                  
                  <div className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    auditResult.passed 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  )}>
                    {auditResult.passed ? 'Passed' : 'Failed'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      {auditResult.summary.errors}
                    </div>
                    <div className="text-gray-600">Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">
                      {auditResult.summary.warnings}
                    </div>
                    <div className="text-gray-600">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {auditResult.summary.info}
                    </div>
                    <div className="text-gray-600">Info</div>
                  </div>
                </div>

                {auditResult.issues.length > 0 && (
                  <details className="mt-4">
                    <summary className="text-sm font-medium text-gray-900 cursor-pointer hover:text-gray-700">
                      View Issues ({auditResult.issues.length})
                    </summary>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {auditResult.issues.slice(0, 5).map((issue, index) => (
                        <div key={index} className="text-sm p-2 bg-white rounded border">
                          <div className={cn(
                            'font-medium',
                            issue.severity === 'error' ? 'text-red-600' :
                            issue.severity === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          )}>
                            {issue.type.toUpperCase()}: {issue.description}
                          </div>
                          <div className="text-gray-600 text-xs mt-1">
                            {issue.recommendation}
                          </div>
                        </div>
                      ))}
                      {auditResult.issues.length > 5 && (
                        <div className="text-xs text-gray-500 text-center">
                          And {auditResult.issues.length - 5} more issues...
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <AccessibleButton
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Close
            </AccessibleButton>
          </div>
        </div>
      </AccessibleModal>
    </>
  );
};

export { AccessibilityPanel };
export default AccessibilityPanel;

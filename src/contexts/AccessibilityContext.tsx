/**
 * Accessibility Provider for Dead Horse Gallery
 * Manages global accessibility settings and features
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { MOTION } from '@/lib/accessibility';
import AccessibilityAuditor, { AccessibilityAuditResult } from '@/lib/accessibility-audit';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  focusVisible: boolean;
  announcements: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  runAudit: () => Promise<AccessibilityAuditResult | null>;
  auditResult: AccessibilityAuditResult | null;
  isAuditing: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    focusVisible: true,
    announcements: true,
    keyboardNavigation: true,
  });

  const [auditResult, setAuditResult] = useState<AccessibilityAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Initialize accessibility settings from user preferences and system
  useEffect(() => {
    const initializeSettings = () => {
      const savedSettings = localStorage.getItem('accessibility-settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prevSettings => ({ ...prevSettings, ...parsed }));
        } catch (error) {
          logger.warn('Failed to parse saved accessibility settings', { error });
        }
      }

      // Check system preferences
      const prefersReducedMotion = MOTION.prefersReducedMotion();
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

      setSettings(prevSettings => ({
        ...prevSettings,
        reducedMotion: prevSettings.reducedMotion || prefersReducedMotion,
        highContrast: prevSettings.highContrast || prefersHighContrast,
      }));

      logger.info('Accessibility settings initialized', {
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      });
    };

    initializeSettings();
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQueries = [
      {
        query: window.matchMedia('(prefers-reduced-motion: reduce)'),
        setting: 'reducedMotion' as keyof AccessibilitySettings,
      },
      {
        query: window.matchMedia('(prefers-contrast: high)'),
        setting: 'highContrast' as keyof AccessibilitySettings,
      },
    ];

    const handlers = mediaQueries.map(({ query, setting }) => {
      const handler = (e: MediaQueryListEvent) => {
        setSettings(prev => ({ ...prev, [setting]: e.matches }));
        logger.info('System accessibility preference changed', {
          setting,
          value: e.matches,
        });
      };

      query.addEventListener('change', handler);
      return { query, handler };
    });

    return () => {
      handlers.forEach(({ query, handler }) => {
        query.removeEventListener('change', handler);
      });
    };
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // Apply CSS classes based on settings
    const root = document.documentElement;
    
    if (settings.reducedMotion) {
      root.classList.add('motion-reduce');
    } else {
      root.classList.remove('motion-reduce');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    logger.debug('Accessibility settings applied', settings);
  }, [settings]);

  // Global keyboard event handler for accessibility shortcuts
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      const activeElement = document.activeElement;
      if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
        return;
      }

      // Alt + Shift + A: Toggle announcements
      if (event.altKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        updateSetting('announcements', !settings.announcements);
        return;
      }

      // Alt + Shift + M: Toggle reduced motion
      if (event.altKey && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        updateSetting('reducedMotion', !settings.reducedMotion);
        return;
      }

      // Alt + Shift + C: Toggle high contrast
      if (event.altKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        updateSetting('highContrast', !settings.highContrast);
        return;
      }

      // Alt + Shift + F: Toggle focus indicators
      if (event.altKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        updateSetting('focusVisible', !settings.focusVisible);
        return;
      }
    };

    if (settings.keyboardNavigation) {
      document.addEventListener('keydown', handleKeyboard);
    }

    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [settings, updateSetting]);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (settings.announcements) {
      const settingName = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      const status = value ? 'enabled' : 'disabled';
      const announcement = `${settingName} ${status}`;
      
      // Create a live region announcement
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      
      document.body.appendChild(announcer);
      setTimeout(() => document.body.removeChild(announcer), 1000);
    }

    logger.info('Accessibility setting updated', { key, value });
  }, [settings.announcements]);

  const runAudit = async (): Promise<AccessibilityAuditResult | null> => {
    setIsAuditing(true);
    
    try {
      const auditor = new AccessibilityAuditor();
      const result = await auditor.audit(document.body);
      
      setAuditResult(result);
      
      logger.info('Accessibility audit completed', {
        score: result.score,
        passed: result.passed,
        issues: result.summary,
      });

      if (settings.announcements) {
        const message = result.passed 
          ? `Accessibility audit passed with score ${result.score}/100`
          : `Accessibility audit found ${result.summary.errors} errors and ${result.summary.warnings} warnings`;
        
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'assertive');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = message;
        
        document.body.appendChild(announcer);
        setTimeout(() => document.body.removeChild(announcer), 2000);
      }

      return result;
    } catch (error) {
      logger.error('Accessibility audit failed', { error });
      return null;
    } finally {
      setIsAuditing(false);
    }
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    runAudit,
    auditResult,
    isAuditing,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;

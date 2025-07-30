import { logger } from '@/lib/logger';

export interface SessionConfig {
  /** Timeout for general authenticated sessions (default: 4 hours) */
  sessionTimeout: number;
  /** Timeout for sensitive operations requiring recent authentication (default: 15 minutes) */
  sensitiveActionTimeout: number;
  /** Warning time before session expires (default: 5 minutes) */
  warningTime: number;
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  sessionTimeout: 4 * 60 * 60 * 1000, // 4 hours
  sensitiveActionTimeout: 15 * 60 * 1000, // 15 minutes
  warningTime: 5 * 60 * 1000, // 5 minutes
};

export class SessionManager {
  private config: SessionConfig;
  private sessionStart: number;
  private lastActivity: number;
  private lastSensitiveAuth: number | null = null;
  private warningShown: boolean = false;
  private timeoutWarningCallback?: () => void;
  private sessionExpiredCallback?: () => void;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
    this.sessionStart = Date.now();
    this.lastActivity = Date.now();
    
    logger.info('Session manager initialized', {
      sessionTimeout: this.config.sessionTimeout / (60 * 1000) + ' minutes',
      sensitiveTimeout: this.config.sensitiveActionTimeout / (60 * 1000) + ' minutes'
    });
  }

  /**
   * Update last activity timestamp
   */
  updateActivity(): void {
    this.lastActivity = Date.now();
    this.warningShown = false;
    logger.debug('Session activity updated');
  }

  /**
   * Mark that a sensitive authentication just occurred
   */
  markSensitiveAuth(): void {
    this.lastSensitiveAuth = Date.now();
    this.updateActivity();
    logger.info('Sensitive authentication marked');
  }

  /**
   * Check if the session is still valid
   */
  isSessionValid(): boolean {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;
    const isValid = timeSinceActivity < this.config.sessionTimeout;
    
    if (!isValid) {
      logger.warn('Session expired due to inactivity', {
        timeSinceActivity: Math.round(timeSinceActivity / (60 * 1000)) + ' minutes'
      });
    }
    
    return isValid;
  }

  /**
   * Check if sensitive actions are allowed (recent authentication required)
   */
  canPerformSensitiveAction(): boolean {
    if (!this.lastSensitiveAuth) {
      logger.info('Sensitive action blocked: no recent authentication');
      return false;
    }

    const now = Date.now();
    const timeSinceSensitiveAuth = now - this.lastSensitiveAuth;
    const canPerform = timeSinceSensitiveAuth < this.config.sensitiveActionTimeout;
    
    if (!canPerform) {
      logger.info('Sensitive action blocked: authentication expired', {
        timeSinceAuth: Math.round(timeSinceSensitiveAuth / (60 * 1000)) + ' minutes'
      });
    }
    
    return canPerform;
  }

  /**
   * Get time remaining until session expires
   */
  getTimeUntilExpiry(): number {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;
    return Math.max(0, this.config.sessionTimeout - timeSinceActivity);
  }

  /**
   * Get time remaining until sensitive auth expires
   */
  getTimeUntilSensitiveExpiry(): number {
    if (!this.lastSensitiveAuth) return 0;
    
    const now = Date.now();
    const timeSinceSensitiveAuth = now - this.lastSensitiveAuth;
    return Math.max(0, this.config.sensitiveActionTimeout - timeSinceSensitiveAuth);
  }

  /**
   * Check if warning should be shown
   */
  shouldShowWarning(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    const shouldShow = timeUntilExpiry <= this.config.warningTime && !this.warningShown;
    
    if (shouldShow) {
      this.warningShown = true;
      logger.info('Session expiry warning triggered', {
        timeRemaining: Math.round(timeUntilExpiry / (60 * 1000)) + ' minutes'
      });
    }
    
    return shouldShow;
  }

  /**
   * Set callback for timeout warnings
   */
  onTimeoutWarning(callback: () => void): void {
    this.timeoutWarningCallback = callback;
  }

  /**
   * Set callback for session expiration
   */
  onSessionExpired(callback: () => void): void {
    this.sessionExpiredCallback = callback;
  }

  /**
   * Start monitoring session timeouts
   */
  startMonitoring(intervalMs: number = 30000): () => void {
    const interval = setInterval(() => {
      if (!this.isSessionValid()) {
        this.sessionExpiredCallback?.();
        clearInterval(interval);
        return;
      }

      if (this.shouldShowWarning()) {
        this.timeoutWarningCallback?.();
      }
    }, intervalMs);

    logger.info('Session monitoring started', {
      intervalSeconds: intervalMs / 1000
    });

    // Return cleanup function
    return () => {
      clearInterval(interval);
      logger.info('Session monitoring stopped');
    };
  }

  /**
   * Extend session (useful for "stay logged in" actions)
   */
  extendSession(): void {
    this.updateActivity();
    logger.info('Session extended by user action');
  }

  /**
   * Reset session completely
   */
  resetSession(): void {
    this.sessionStart = Date.now();
    this.lastActivity = Date.now();
    this.lastSensitiveAuth = null;
    this.warningShown = false;
    logger.info('Session reset');
  }

  /**
   * Get session info for debugging
   */
  getSessionInfo() {
    const now = Date.now();
    return {
      sessionAge: Math.round((now - this.sessionStart) / (60 * 1000)),
      timeSinceActivity: Math.round((now - this.lastActivity) / (60 * 1000)),
      timeSinceSensitiveAuth: this.lastSensitiveAuth 
        ? Math.round((now - this.lastSensitiveAuth) / (60 * 1000))
        : null,
      timeUntilExpiry: Math.round(this.getTimeUntilExpiry() / (60 * 1000)),
      timeUntilSensitiveExpiry: Math.round(this.getTimeUntilSensitiveExpiry() / (60 * 1000)),
      isValid: this.isSessionValid(),
      canPerformSensitive: this.canPerformSensitiveAction()
    };
  }
}

// Global session manager instance
let globalSessionManager: SessionManager | null = null;

/**
 * Get or create the global session manager
 */
export function getSessionManager(config?: Partial<SessionConfig>): SessionManager {
  if (!globalSessionManager) {
    globalSessionManager = new SessionManager(config);
  }
  return globalSessionManager;
}

/**
 * Reset the global session manager (useful for logout)
 */
export function resetGlobalSession(): void {
  if (globalSessionManager) {
    globalSessionManager.resetSession();
  }
}

/**
 * Sensitive actions that require recent authentication
 */
export const SENSITIVE_ACTIONS = {
  PAYMENT: 'payment',
  PROFILE_UPDATE: 'profile_update',
  EMAIL_CHANGE: 'email_change',
  WALLET_CONNECT: 'wallet_connect',
  ARTWORK_PURCHASE: 'artwork_purchase',
  GALLERY_SUBMISSION: 'gallery_submission'
} as const;

export type SensitiveAction = typeof SENSITIVE_ACTIONS[keyof typeof SENSITIVE_ACTIONS];

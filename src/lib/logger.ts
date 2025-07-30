/**
 * Logger utility for Dead Horse Gallery
 * Provides environment-based logging with different levels
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown> | string | number | boolean | null;
  timestamp: string;
  context?: string;
  errorId?: string;
  performanceMetrics?: PerformanceMetric;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  metadata?: Record<string, unknown>;
}

type LogData = Record<string, unknown> | string | number | boolean | null;

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;
  private enableConsoleLogs: boolean;
  private performanceMarks = new Map<string, number>();

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.enableConsoleLogs = process.env.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS === 'true' || this.isDevelopment;
    
    // Set log level based on environment
    const envLogLevel = process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase();
    switch (envLogLevel) {
      case 'ERROR':
        this.logLevel = LogLevel.ERROR;
        break;
      case 'WARN':
        this.logLevel = LogLevel.WARN;
        break;
      case 'INFO':
        this.logLevel = LogLevel.INFO;
        break;
      case 'DEBUG':
        this.logLevel = LogLevel.DEBUG;
        break;
      default:
        this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, data?: LogData, context?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? `[${context}] ` : '';
    
    if (data) {
      return `${timestamp} ${levelName} ${contextStr}${message} ${JSON.stringify(data)}`;
    }
    return `${timestamp} ${levelName} ${contextStr}${message}`;
  }

  private log(level: LogLevel, message: string, data?: LogData, context?: string): void {
    if (!this.shouldLog(level) || !this.enableConsoleLogs) return;

    const formattedMessage = this.formatMessage(level, message, data, context);

    // In development, use console methods for better DevTools experience
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.log(formattedMessage);
          break;
      }
    } else {
      // In production, only log errors and warnings
      if (level <= LogLevel.WARN) {
        console.error(formattedMessage);
      }
    }
  }

  error(message: string, data?: LogData, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  warn(message: string, data?: LogData, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  info(message: string, data?: LogData, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  debug(message: string, data?: LogData, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  // User action tracking for analytics/debugging
  userAction(action: string, data?: LogData, context?: string): void {
    this.debug(`User Action: ${action}`, data, context);
  }

  // Payment-related actions (important for debugging)
  payment(message: string, data?: LogData): void {
    this.info(`Payment: ${message}`, data, 'PAYMENT');
  }

  // Auth-related actions
  auth(message: string, data?: LogData): void {
    this.info(`Auth: ${message}`, data, 'AUTH');
  }

  // API calls
  api(message: string, data?: LogData): void {
    this.debug(`API: ${message}`, data, 'API');
  }

  // Performance monitoring methods
  startPerformanceMark(name: string): void {
    if (typeof performance !== 'undefined') {
      const startTime = performance.now();
      this.performanceMarks.set(name, startTime);
      
      this.debug(`Performance mark started: ${name}`, {
        performanceMark: name,
        startTime,
      });
    }
  }

  endPerformanceMark(name: string, metadata?: Record<string, unknown>): PerformanceMetric | null {
    if (typeof performance === 'undefined') return null;

    const startTime = this.performanceMarks.get(name);
    if (!startTime) {
      this.warn(`Performance mark "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetric = {
      name,
      duration,
      startTime,
      endTime,
      metadata,
    };

    this.performanceMarks.delete(name);

    this.info(`Performance measurement: ${name}`, {
      performance: metric,
      duration: `${duration.toFixed(2)}ms`,
    });

    // Send performance data to external services
    this.sendToExternalService('info', `Performance: ${name}`, {
      type: 'performance',
      metric,
    });

    return metric;
  }

  // External service integration
  private sendToExternalService(level: string, message: string, context?: LogData) {
    if (typeof window === 'undefined') return;

    try {
      // Example: Google Analytics integration
      const windowWithGtag = window as Window & typeof globalThis & {
        gtag?: (command: string, eventName: string, parameters: Record<string, unknown>) => void;
      };

      if (windowWithGtag.gtag && (level === 'error' || level === 'warn')) {
        windowWithGtag.gtag('event', 'log_event', {
          event_category: 'logging',
          event_label: level,
          description: message,
          ...(typeof context === 'object' && context !== null ? context : {}),
        });
      }
    } catch (error) {
      // Fail silently to avoid logging loops
      log.warn('Failed to send log to external service:', { data: error });
    }
  }

  // Enhanced tracking methods
  trackPageLoad(pageName: string, loadTime?: number) {
    this.info(`Page loaded: ${pageName}`, {
      type: 'page_load',
      page: pageName,
      loadTime,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }

  trackApiCall(endpoint: string, method: string, duration?: number, status?: number) {
    this.info(`API call: ${method} ${endpoint}`, {
      type: 'api_call',
      endpoint,
      method,
      duration,
      status,
    });
  }

  trackAuthEvent(event: string, context?: LogData) {
    this.info(`Auth event: ${event}`, {
      type: 'auth_event',
      event,
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }

  trackPaymentEvent(event: string, context?: LogData) {
    this.info(`Payment event: ${event}`, {
      type: 'payment_event',
      event,
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }

  // Gallery-specific tracking methods
  trackArtworkView(artworkId: string, artistId?: string, context?: LogData) {
    this.info(`Artwork viewed: ${artworkId}`, {
      type: 'artwork_view',
      artworkId,
      artistId,
      timestamp: new Date().toISOString(),
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }

  trackArtworkInteraction(action: 'like' | 'share' | 'save' | 'contact', artworkId: string, context?: LogData) {
    this.info(`Artwork ${action}: ${artworkId}`, {
      type: 'artwork_interaction',
      action,
      artworkId,
      timestamp: new Date().toISOString(),
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }

  trackGalleryNavigation(from: string, to: string, context?: LogData) {
    this.debug(`Navigation: ${from} -> ${to}`, {
      type: 'navigation',
      from,
      to,
      timestamp: new Date().toISOString(),
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }

  trackSearchQuery(query: string, results: number, filters?: Record<string, unknown>) {
    this.info(`Search query: "${query}"`, {
      type: 'search',
      query,
      resultsCount: results,
      filters,
      timestamp: new Date().toISOString(),
    });
  }

  trackErrorBoundary(error: Error, errorInfo: Record<string, unknown>, component?: string) {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.error(`Error Boundary Caught: ${error.message}`, {
      type: 'error_boundary',
      errorId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      component,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    });

    return errorId;
  }

  trackComponentMount(componentName: string, props?: Record<string, unknown>) {
    this.debug(`Component mounted: ${componentName}`, {
      type: 'component_lifecycle',
      event: 'mount',
      component: componentName,
      props: props ? Object.keys(props) : undefined, // Don't log actual prop values for privacy
      timestamp: new Date().toISOString(),
    });
  }

  trackComponentUnmount(componentName: string, timeOnPage?: number) {
    this.debug(`Component unmounted: ${componentName}`, {
      type: 'component_lifecycle',
      event: 'unmount',
      component: componentName,
      timeOnPage,
      timestamp: new Date().toISOString(),
    });
  }

  trackFormSubmission(formName: string, success: boolean, validationErrors?: string[], context?: LogData) {
    this.info(`Form ${success ? 'submitted' : 'failed'}: ${formName}`, {
      type: 'form_submission',
      formName,
      success,
      validationErrors,
      timestamp: new Date().toISOString(),
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }

  trackProtectedAction(intent: string, authRequired: boolean, userState: string, context?: LogData) {
    this.debug(`Protected action: ${intent}`, {
      type: 'protected_action',
      intent,
      authRequired,
      userState,
      timestamp: new Date().toISOString(),
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }

  // Enhanced error logging with automatic context
  errorWithContext(error: Error | string, additionalContext?: LogData, component?: string) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.error(`Error: ${errorObj.message}`, {
      errorId,
      error: {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
      },
      component,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      ...(typeof additionalContext === 'object' && additionalContext !== null ? additionalContext : {}),
    });

    return errorId;
  }

  // Toast notification logging (for UX tracking)
  trackToast(type: 'success' | 'error' | 'warning' | 'info', message: string, context?: LogData) {
    this.debug(`Toast shown: ${type}`, {
      type: 'toast_notification',
      toastType: type,
      message,
      timestamp: new Date().toISOString(),
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }

  // Modal interaction tracking
  trackModal(action: 'open' | 'close' | 'interact', modalName: string, context?: LogData) {
    this.debug(`Modal ${action}: ${modalName}`, {
      type: 'modal_interaction',
      action,
      modalName,
      timestamp: new Date().toISOString(),
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }

  // A/B testing and feature flag logging
  trackFeatureFlag(flagName: string, variant: string, context?: LogData) {
    this.debug(`Feature flag: ${flagName} = ${variant}`, {
      type: 'feature_flag',
      flagName,
      variant,
      timestamp: new Date().toISOString(),
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }

  // Real-time monitoring for critical operations
  trackCriticalOperation(operation: string, success: boolean, duration?: number, context?: LogData) {
    const level = success ? 'info' : 'error';
    this[level](`Critical operation ${success ? 'succeeded' : 'failed'}: ${operation}`, {
      type: 'critical_operation',
      operation,
      success,
      duration,
      timestamp: new Date().toISOString(),
      ...(typeof context === 'object' && context !== null ? context : {}),
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  error: (message: string, data?: LogData, context?: string) => logger.error(message, data, context),
  warn: (message: string, data?: LogData, context?: string) => logger.warn(message, data, context),
  info: (message: string, data?: LogData, context?: string) => logger.info(message, data, context),
  debug: (message: string, data?: LogData, context?: string) => logger.debug(message, data, context),
  userAction: (action: string, data?: LogData, context?: string) => logger.userAction(action, data, context),
  payment: (message: string, data?: LogData) => logger.payment(message, data),
  auth: (message: string, data?: LogData) => logger.auth(message, data),
  api: (message: string, data?: LogData) => logger.api(message, data),
  
  // Performance tracking
  startPerformanceMark: (name: string) => logger.startPerformanceMark(name),
  endPerformanceMark: (name: string, metadata?: Record<string, unknown>) => logger.endPerformanceMark(name, metadata),
  
  // Enhanced tracking
  trackPageLoad: (pageName: string, loadTime?: number) => logger.trackPageLoad(pageName, loadTime),
  trackApiCall: (endpoint: string, method: string, duration?: number, status?: number) => 
    logger.trackApiCall(endpoint, method, duration, status),
  trackAuthEvent: (event: string, context?: LogData) => logger.trackAuthEvent(event, context),
  trackPaymentEvent: (event: string, context?: LogData) => logger.trackPaymentEvent(event, context),
};

# Sentry Integration Setup - Dead Horse Gallery

## Overview

This guide provides step-by-step instructions for integrating Sentry error monitoring with the Dead Horse Gallery application.

## Prerequisites

1. Enhanced logging system is already implemented ✅
2. ErrorBoundary component is Sentry-ready ✅
3. Logger has external service integration hooks ✅

## Installation

### 1. Install Sentry SDK

```bash
npm install @sentry/nextjs
```

### 2. Create Sentry Configuration

Create `sentry.client.config.ts` in the project root:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Capture 100% of transactions in development, 10% in production
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  
  // Capture 100% of sessions for performance monitoring
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  beforeSend(event) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_FORCE_DEV) {
      return null;
    }
    return event;
  },
});
```

Create `sentry.server.config.ts` in the project root:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
});
```

### 3. Update Next.js Configuration

Update `next.config.ts`:

```typescript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // ... existing configuration
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
```

## Environment Variables

Add to your `.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Optional: Force Sentry in development
SENTRY_FORCE_DEV=false
```

## Integration with Existing Logger

Update `src/lib/logger.ts` to enable Sentry integration:

```typescript
// Add this to the sendToExternalService method
private sendToExternalService(level: string, message: string, context?: LogData) {
  if (typeof window === 'undefined') return;

  try {
    // Sentry integration
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      
      if (level === 'error') {
        if (context && typeof context === 'object' && 'error' in context) {
          Sentry.captureException(context.error, {
            level: 'error',
            extra: { message, ...context },
          });
        } else {
          Sentry.captureMessage(message, 'error');
        }
      } else if (level === 'warn') {
        Sentry.captureMessage(message, 'warning');
      }
      
      // Add breadcrumb for all levels
      Sentry.addBreadcrumb({
        message,
        level: level as any,
        data: typeof context === 'object' ? context : { context },
        timestamp: Date.now() / 1000,
      });
    }

    // ... existing Google Analytics and other integrations
  } catch (error) {
    console.warn('Failed to send log to external service:', error);
  }
}
```

## Enhanced ErrorBoundary Integration

Update `src/components/ErrorBoundary.tsx` to include Sentry integration:

```typescript
// Add this to the sendToExternalLogger method
private sendToExternalLogger = (error: Error, errorInfo: React.ErrorInfo, errorId?: string) => {
  if (typeof window !== 'undefined') {
    // Sentry integration
    if ((window as any).Sentry) {
      (window as any).Sentry.withScope((scope: any) => {
        scope.setTag('errorBoundary', true);
        scope.setTag('errorId', errorId);
        scope.setLevel('error');
        scope.setContext('errorInfo', errorInfo);
        scope.setContext('errorDetails', {
          errorId,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        });
        
        (window as any).Sentry.captureException(error);
      });
    }

    // ... existing integrations (LogRocket, Datadog, etc.)
  }
};
```

## Custom Sentry Hooks

Create `src/hooks/useSentryIntegration.ts`:

```typescript
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useHybridAuth } from '@/contexts/HybridAuthContext';

export function useSentryIntegration() {
  const { user, authState } = useHybridAuth();

  useEffect(() => {
    // Set user context when auth state changes
    Sentry.setUser({
      id: user?.issuer || 'anonymous',
      email: user?.email || undefined,
    });

    // Set additional context
    Sentry.setTag('authState', authState);
    Sentry.setContext('userProfile', {
      authState,
      hasWallet: !!user?.publicAddress,
      timestamp: new Date().toISOString(),
    });
  }, [user, authState]);

  return {
    captureException: Sentry.captureException,
    captureMessage: Sentry.captureMessage,
    addBreadcrumb: Sentry.addBreadcrumb,
  };
}
```

## Performance Monitoring

Add performance monitoring to key components:

```typescript
// In components that need performance monitoring
import * as Sentry from '@sentry/nextjs';

function ArtworkDetail() {
  useEffect(() => {
    const transaction = Sentry.startTransaction({
      name: 'ArtworkDetail',
      op: 'component-load',
    });
    
    // Set transaction on scope
    Sentry.getCurrentHub().configureScope((scope) => {
      scope.setSpan(transaction);
    });

    return () => {
      transaction.finish();
    };
  }, []);

  // ... component logic
}
```

## Sentry Dashboard Configuration

### 1. Error Alerts

Set up alerts for:
- New error types
- Error rate spikes (>10% increase)
- Performance degradation
- Critical errors in payment flows

### 2. Custom Dashboards

Create dashboards for:
- Authentication flow errors
- Payment processing issues
- Page load performance
- User journey failures

### 3. Release Tracking

```bash
# In your CI/CD pipeline
npx @sentry/cli releases new $VERSION
npx @sentry/cli releases files $VERSION upload-sourcemaps ./dist
npx @sentry/cli releases finalize $VERSION
```

## Testing Sentry Integration

Create a test endpoint to verify Sentry is working:

```typescript
// /app/api/test-sentry/route.ts
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    // Test different types of events
    Sentry.addBreadcrumb({
      message: 'Sentry test initiated',
      level: 'info',
    });

    // Test exception capture
    throw new Error('Test error from Dead Horse Gallery');
  } catch (error) {
    Sentry.captureException(error);
    
    return Response.json({
      message: 'Test error sent to Sentry',
      timestamp: new Date().toISOString()
    });
  }
}
```

## Production Deployment

### Vercel Deployment

Add to your Vercel environment variables:
```bash
NEXT_PUBLIC_SENTRY_DSN=your_production_dsn
SENTRY_ORG=dead-horse-gallery
SENTRY_PROJECT=dead-horse-frontend
SENTRY_AUTH_TOKEN=your_auth_token
```

### Build Configuration

Update `package.json` scripts:

```json
{
  "scripts": {
    "build": "next build",
    "build:sentry": "SENTRY_UPLOAD_SOURCEMAPS=true next build"
  }
}
```

## Benefits

### Development
- Real-time error notifications
- Detailed error context and stack traces
- Performance insights
- User session replay

### Production
- Proactive error detection
- Performance monitoring
- Release health tracking
- User impact analysis

### Business Intelligence
- Error impact on conversion rates
- Performance bottlenecks affecting user experience
- Feature adoption and usage patterns

## Best Practices

1. **Error Filtering**: Filter out non-actionable errors
2. **Rate Limiting**: Prevent spam from recurring errors
3. **PII Protection**: Ensure no sensitive data is logged
4. **Team Alerts**: Set up team notifications for critical errors
5. **Regular Review**: Weekly error review and triage

This Sentry integration provides comprehensive error monitoring and performance tracking for the Dead Horse Gallery application.

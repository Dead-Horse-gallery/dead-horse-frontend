# Environment Configuration Guide - Dead Horse Gallery

## Required Environment Variables

This file documents all environment variables required for the Dead Horse Gallery application to function properly.

### Core Application (.env.local)

```bash
# Next.js Configuration
NODE_ENV=development # or production
NEXT_PUBLIC_LOG_LEVEL=DEBUG # ERROR, WARN, INFO, DEBUG
NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=true # Enable console logs in development

# Database Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
MAGIC_SECRET_KEY=your_magic_secret_key
NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=your_magic_publishable_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Security
NEXTAUTH_SECRET=your_nextauth_secret_32_chars_minimum
NEXTAUTH_URL=http://localhost:3000 # or your production URL

# External Logging Services (Optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_LOGROCKET_APP_ID=your_logrocket_app_id
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_datadog_client_token
NEXT_PUBLIC_DATADOG_APPLICATION_ID=your_datadog_app_id

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_google_analytics_id
```

### Production Environment (.env.production)

```bash
# Production overrides
NODE_ENV=production
NEXT_PUBLIC_LOG_LEVEL=WARN
NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=false

# Production URLs
NEXTAUTH_URL=https://your-domain.com
```

## Environment Variable Validation

The application includes environment variable validation to ensure all required variables are present:

### Current Validation (src/lib/env.ts)

```typescript
export const env = {
  NODE_ENV: process.env.NODE_ENV,
  MAGIC_SECRET_KEY: process.env.MAGIC_SECRET_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  // ... other required variables
}
```

## Setup Instructions

### 1. Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values:
   - Get Supabase credentials from your Supabase dashboard
   - Get Magic.link keys from your Magic dashboard
   - Get Stripe keys from your Stripe dashboard

### 2. Production Setup

1. Set environment variables in your hosting platform:
   - Vercel: Add in Project Settings > Environment Variables
   - Netlify: Add in Site Settings > Environment Variables
   - Docker: Use environment files or container orchestration

### 3. External Services Setup

#### Sentry Error Tracking
1. Create a Sentry project
2. Add `NEXT_PUBLIC_SENTRY_DSN` to your environment
3. Install Sentry SDK: `npm install @sentry/nextjs`

#### LogRocket Session Replay
1. Create a LogRocket account
2. Add `NEXT_PUBLIC_LOGROCKET_APP_ID` to your environment
3. Install LogRocket SDK: `npm install logrocket`

#### Datadog Real User Monitoring
1. Create a Datadog RUM application
2. Add `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN` and `NEXT_PUBLIC_DATADOG_APPLICATION_ID`
3. Install Datadog SDK: `npm install @datadog/browser-rum`

## Security Considerations

### Environment Variable Security

1. **Never commit .env files** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** especially for production
4. **Limit API key permissions** to minimum required scope

### Recommended Practices

```bash
# Add to .gitignore
.env*
!.env.example

# Use environment-specific files
.env.local          # Local development overrides
.env.development    # Development environment
.env.staging        # Staging environment  
.env.production     # Production environment
```

## Troubleshooting

### Common Issues

1. **"Environment variable not found"**
   - Check variable name spelling
   - Ensure variable is set in correct .env file
   - Restart development server after adding variables

2. **"Invalid API key"**
   - Verify key is correct and not expired
   - Check if key has required permissions
   - Ensure you're using the right environment (test vs live)

3. **CORS errors**
   - Add your domain to service provider's allowed origins
   - Check NEXTAUTH_URL is set correctly

### Health Check

Add this to your application to verify environment setup:

```typescript
// /app/api/health/route.ts
export async function GET() {
  const requiredVars = [
    'MAGIC_SECRET_KEY',
    'SUPABASE_URL', 
    'STRIPE_SECRET_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  return Response.json({
    status: missing.length === 0 ? 'healthy' : 'error',
    missing,
    timestamp: new Date().toISOString()
  });
}
```

## Environment-Specific Features

### Development
- Detailed logging enabled
- Hot reload with environment changes
- Debug tools available
- Test API keys for external services

### Production
- Minimal logging (errors and warnings only)
- Performance optimizations enabled
- Security headers enforced
- Live API keys for external services

This environment configuration ensures the Dead Horse Gallery application runs smoothly across all environments while maintaining security and observability.

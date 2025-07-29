import { NextResponse } from 'next/server';
import { env } from '../lib/env';

// Trusted domains for CORS and CSP
const TRUSTED_DOMAINS = [
  env.NEXT_PUBLIC_APP_URL,
  'https://js.stripe.com',
  'https://api.stripe.com',
  'https://checkout.stripe.com',
  env.NEXT_PUBLIC_SUPABASE_URL,
  'https://auth.magic.link',
  'https://api.magic.link',
  'wss://realtime.supabase.io'
].filter(Boolean).map(domain => domain.replace(/\/$/, '')); // Remove trailing slashes

const securityHeaders = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // XSS Protection
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Cross-Origin Policies
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-site',
  
  // Content Security Policy
  'Content-Security-Policy': [
    // Default fallback: only allow resources from same origin
    "default-src 'self'",
    
    // Scripts: allow from trusted domains
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://auth.magic.link https://api.magic.link",
    
    // Styles: allow from same origin and inline styles needed for dynamic content
    "style-src 'self' 'unsafe-inline'",
    
    // Images: allow from same origin, data URLs, and HTTPS sources
    "img-src 'self' data: blob: https: *.stripe.com",
    
    // Connect: allow API requests to trusted domains
    `connect-src 'self' ${TRUSTED_DOMAINS.join(' ')}`,
    
    // Frames: restrict to specific trusted domains
    "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://auth.magic.link",
    
    // Fonts: restrict to same origin
    "font-src 'self'",
    
    // Media and workers
    "media-src 'self'",
    "worker-src 'self' blob:",
    
    // Restrict object, embed, and other resources
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    
    // Security enhancements
    "block-all-mixed-content",
    "upgrade-insecure-requests",
    
    // Manifest
    "manifest-src 'self'"
  ].join('; '),
  
  // Permissions Policy - restricts browser features
  'Permissions-Policy': [
    // Disable unnecessary sensors and hardware access
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'battery=()',
    'camera=()',
    'display-capture=()',
    'document-domain=()',
    'encrypted-media=()',
    'execution-while-not-rendered=()',
    'execution-while-out-of-viewport=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'navigation-override=()',
    'payment=(self)', // Allow payment API only for same origin
    'picture-in-picture=()',
    'publickey-credentials-get=()',
    'screen-wake-lock=()',
    'sync-xhr=()',
    'usb=()',
    'web-share=()',
    'xr-spatial-tracking=()'
  ].join(', '),
  
  // Strict Transport Security
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

export function applySecurityHeaders({ response }: { response: NextResponse; }): NextResponse<unknown> {
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

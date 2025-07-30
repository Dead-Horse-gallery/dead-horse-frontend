import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { log } from './lib/logger';

// Generate a unique nonce for each request using Web Crypto API (Edge Runtime compatible)
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Enhanced CSP with nonce support
function getCSPWithNonce(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://magic.link https://auth.magic.link`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://auth.magic.link https://rpc.magic.link wss: https:",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://auth.magic.link",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://auth.magic.link",
    "upgrade-insecure-requests"
  ].join('; ');
}

// HSTS and other security headers
function getSecurityHeaders(nonce?: string) {
  const headers: Record<string, string> = {
    // HSTS - Force HTTPS for 1 year
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
    
    // Cross-Origin policies
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  };

  // Add CSP with nonce if provided
  if (nonce) {
    headers['Content-Security-Policy'] = getCSPWithNonce(nonce);
    headers['X-Nonce'] = nonce; // Pass nonce to the page
  }

  return headers;
}

export async function middleware(request: NextRequest) {
  // Generate nonce for this request
  const nonce = generateNonce();
  
  // Create response
  const response = NextResponse.next();

  // Add security headers to all responses
  const securityHeaders = getSecurityHeaders(nonce);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Only run authentication logic on protected routes
  const protectedPaths = ['/api/protected', '/dashboard', '/apply'];
  const shouldProtect = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (!shouldProtect) {
    return response;
  }

  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      const errorResponse = new NextResponse(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...securityHeaders
          } 
        }
      );
      return errorResponse;
    }

    const didToken = authHeader.split('Bearer ')[1];
    
    try {
      // Basic token format validation
      if (!didToken || didToken.length < 10) {
        throw new Error('Invalid token format');
      }

      // Add user info to request headers for downstream handlers  
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-auth-validated', 'true');
      requestHeaders.set('x-nonce', nonce); // Pass nonce to request

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
        headers: securityHeaders
      });
    } catch (error) {
      log.error('Token validation error', { error, url: request.url });
      return new NextResponse(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...securityHeaders
          } 
        }
      );
    }
  } catch (error) {
    log.error('Middleware error', { error, url: request.url });
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...securityHeaders
        } 
      }
    );
  }
}

export const config = {
  matcher: [
    // Apply to all routes to add security headers
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};

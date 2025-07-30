import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only run on protected routes that need authentication
  const protectedPaths = ['/api/protected', '/dashboard', '/apply'];
  const shouldProtect = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (!shouldProtect) {
    return NextResponse.next();
  }

  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const didToken = authHeader.split('Bearer ')[1];
    
    // For now, we'll validate tokens client-side only
    // This middleware will focus on route protection
    
    try {
      // Basic token format validation
      if (!didToken || didToken.length < 10) {
        throw new Error('Invalid token format');
      }

      // Add user info to request headers for downstream handlers  
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-auth-validated', 'true');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Token validation error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Middleware error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/apply/:path*',
    '/api/protected/:path*'
  ]
};

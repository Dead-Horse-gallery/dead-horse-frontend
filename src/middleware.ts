import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Magic } from '@magic-sdk/admin';

// Initialize Magic admin SDK
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

// Initialize Supabase admin client
if (!process.env.SUPABASE_SERVICE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function middleware(request: NextRequest) {
  // Only run on /api routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401 }
      );
    }

    const didToken = authHeader.split('Bearer ')[1];
    
    // Validate Magic.link token
    try {
      magic.token.validate(didToken);
      const metadata = await magic.users.getMetadataByToken(didToken);

      if (!metadata.issuer) {
        return new NextResponse(
          JSON.stringify({ error: 'Missing user issuer in token metadata' }),
          { status: 401 }
        );
      }
      
      // Get or create Supabase user
      const { data: { user }, error: upsertError } = await supabase.auth.admin.getUserById(
        metadata.issuer
      );

      if (upsertError || !user) {
        // Create new user if they don't exist
        const { error: createError } = await supabase.auth.admin.createUser({
          email: metadata.email ?? undefined,
          id: metadata.issuer
        });

        if (createError) {
          throw createError;
        }
      }

      // Add user info to request headers for downstream handlers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', metadata.issuer);
      requestHeaders.set('x-user-email', metadata.email ?? '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Token validation error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Middleware error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}

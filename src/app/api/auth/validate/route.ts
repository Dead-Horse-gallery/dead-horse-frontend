import { NextRequest, NextResponse } from 'next/server';
import { Magic } from '@magic-sdk/admin';
import { createClient } from '@supabase/supabase-js';

// Initialize Magic admin SDK (server-side only)
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { didToken } = await request.json();

    if (!didToken) {
      return NextResponse.json(
        { error: 'Missing DID token' },
        { status: 400 }
      );
    }

    // Validate Magic.link token
    magic.token.validate(didToken);
    const metadata = await magic.users.getMetadataByToken(didToken);

    if (!metadata.issuer) {
      return NextResponse.json(
        { error: 'Missing user issuer in token metadata' },
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
        id: metadata.issuer,
        user_metadata: {
          magic_issuer: metadata.issuer,
          phone_number: metadata.phoneNumber
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: metadata.issuer,
        email: metadata.email,
        phoneNumber: metadata.phoneNumber
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Invalid authentication token' },
      { status: 401 }
    );
  }
}

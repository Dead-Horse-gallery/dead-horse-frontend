import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { log } from '@/lib/logger';
// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Initialize Supabase client
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Application schema validation
const applicationSchema = z.object({
  portfolio_url: z.string().url().optional(),
  instagram_handle: z.string().optional(),
  artistic_statement: z.string().min(300).max(500),
  experience_level: z.enum(['emerging', 'established', 'professional']),
  art_medium: z.enum([
    'painting',
    'drawing',
    'sculpture',
    'photography',
    'mixed_media',
    'digital',
    'printmaking',
    'ceramics',
    'other'
  ]),
  years_creating: z.string(),
  exhibition_history: z.string().optional(),
  why_dead_horse: z.string().min(100).max(200),
  portfolio_urls: z.array(z.string().url()).min(3).max(6),
  stripe_payment_intent_id: z.string()
});

export async function POST(request: Request) {
  try {
    // Get user info from middleware-added headers
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');

    if (!userId || !userEmail) {
      return new NextResponse(
        JSON.stringify({ error: 'User authentication required' }),
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    // Verify payment was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(
      validatedData.stripe_payment_intent_id
    );

    if (paymentIntent.status !== 'succeeded') {
      return new NextResponse(
        JSON.stringify({ error: 'Payment not completed' }),
        { status: 400 }
      );
    }

    // Store application in database
    const { error: insertError } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        ...validatedData,
        payment_status: 'completed',
        stripe_charge_id: paymentIntent.id,
        amount_paid: paymentIntent.amount / 100 // Convert from cents to dollars
      });

    if (insertError) {
      log.error('Database insertion error:', { error: insertError });
      throw new Error('Failed to save application');
    }

    // Send confirmation email (implement your email service here)
    // await sendConfirmationEmail(userEmail);

    return new NextResponse(
      JSON.stringify({ 
        message: 'Application submitted successfully',
        applicationId: paymentIntent.id 
      }),
      { status: 200 }
    );

  } catch (error) {
    log.error('Application submission error:', { error: error });

    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid application data', 
          details: error.errors 
        }),
        { status: 400 }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: 'Failed to process application' }),
      { status: 500 }
    );
  }
}

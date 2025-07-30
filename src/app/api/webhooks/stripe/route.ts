import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

import { log } from '@/lib/logger';
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing Stripe environment variables');
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

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing stripe signature' }),
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      log.error('Webhook signature verification failed:', { error: err });
      return new NextResponse(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400 }
      );
    }

    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update application status
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            payment_status: 'completed',
            stripe_charge_id: paymentIntent.id,
            amount_paid: paymentIntent.amount / 100,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) {
          log.error('Error updating application:', { error: updateError });
          throw updateError;
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        // Update application status
        const { error: failureError } = await supabase
          .from('applications')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent_id', failedPayment.id);

        if (failureError) {
          log.error('Error updating failed payment:', { error: failureError });
          throw failureError;
        }
        break;

      // Add other event types as needed
    }

    return new NextResponse(JSON.stringify({ received: true }));
  } catch (error) {
    log.error('Webhook error:', { error: error });
    return new NextResponse(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 500 }
    );
  }
}

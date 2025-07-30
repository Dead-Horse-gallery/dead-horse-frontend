import { loadStripe } from '@stripe/stripe-js';
import { log } from './logger';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export async function createPaymentIntent(amount: number): Promise<CreatePaymentIntentResponse> {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    log.error('Error creating payment intent', { error, amount });
    throw error;
  }
}

export { stripePromise };

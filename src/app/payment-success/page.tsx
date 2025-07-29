'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStripe } from '@stripe/react-stripe-js';

export default function PaymentSuccessPage() {
  const stripe = useStripe();
  const router = useRouter();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the "payment_intent_client_secret" query parameter
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (clientSecret) {
      stripe
        .retrievePaymentIntent(clientSecret)
        .then(({ paymentIntent }) => {
          if (!paymentIntent) {
            return;
          }

          switch (paymentIntent.status) {
            case 'succeeded':
              // Payment successful, update local state/database
              setTimeout(() => {
                router.push('/dashboard');
              }, 3000);
              break;
            case 'processing':
              // Payment still processing
              setTimeout(() => {
                window.location.reload();
              }, 2000);
              break;
            case 'requires_payment_method':
              // Payment failed, redirect to payment page
              router.push('/apply');
              break;
            default:
              router.push('/apply');
          }
        })
        .catch((err) => {
          console.error('Error retrieving payment intent:', err);
          router.push('/apply');
        });
    }
  }, [stripe, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-semibold mb-4">Processing Your Payment</h1>
        <p className="text-gray-600">
          Please wait while we confirm your payment. Do not close this window.
        </p>
      </div>
    </div>
  );
}

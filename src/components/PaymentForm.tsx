import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { PaymentIntent } from '@stripe/stripe-js';
import { stripePromise } from '../lib/stripe';
import { useAuth } from '../contexts/AuthContext';

interface PaymentFormWrapperProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: PaymentError) => void;
  metadata?: Record<string, string>;
}


interface PaymentError {
  code: string;
  message: string;
  decline_code?: string;
  payment_intent?: PaymentIntent;
}


const PaymentFormContent = ({ amount, onSuccess, onError }: Omit<PaymentFormWrapperProps, 'clientSecret'>) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate elements are ready
  useEffect(() => {
    if (!stripe || !elements) {
      setValidationError('Payment system is initializing...');
    } else {
      setValidationError(null);
    }
    // Cleanup on unmount
    return () => {
      setValidationError(null);
      setIsProcessing(false);
    };
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!stripe || !elements) {
      setValidationError('Payment system is not ready. Please try again.');
      return;
    }

    if (!user?.email) {
      setValidationError('Please log in to complete the payment.');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          receipt_email: user.email,
          payment_method_data: {
            billing_details: {
              email: user.email,
            }
          }
        },
        redirect: 'always'
      });

      if ('error' in result && result.error) {
        // Handle specific error cases
        const paymentError: PaymentError = {
          code: result.error.code || 'payment_failed',
          message: result.error.message || 'Payment failed',
          decline_code: result.error.decline_code,
        };
        onError(paymentError);
      } else if (
        'paymentIntent' in result &&
        result.paymentIntent &&
        (result.paymentIntent as PaymentIntent).status === 'succeeded'
      ) {
        onSuccess((result.paymentIntent as PaymentIntent).id);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      const error = err as Error;
      onError({
        code: 'payment_failed',
        message: error.message || 'An unexpected error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-lg font-semibold mb-4">
        Payment Amount: ${amount.toFixed(2)}
      </div>
      
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <PaymentElement />
        {validationError && (
          <div className="mt-2 text-red-600 text-sm" role="alert">
            {validationError}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing || !!validationError}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export function PaymentFormWrapper({ clientSecret, amount, onSuccess, onError }: PaymentFormWrapperProps) {
  const options: { clientSecret: string; appearance: { theme: 'stripe' | 'flat' | 'night'; variables: Record<string, string> } } = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0066cc',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '4px'
      }
    }
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormContent 
        amount={amount} 
        onSuccess={onSuccess} 
        onError={onError}
      />
    </Elements>
  );
}

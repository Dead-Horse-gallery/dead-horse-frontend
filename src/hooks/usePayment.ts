"use client";

import { useState } from 'react';
import { createPaymentIntent } from '../lib/stripe';

interface UsePaymentResult {
  initiatePayment: (amount: number) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export function usePayment(): UsePaymentResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (amount: number): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const { clientSecret } = await createPaymentIntent(amount);
      return clientSecret;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiatePayment,
    isLoading,
    error,
  };
}

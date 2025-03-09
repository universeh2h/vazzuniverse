/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreditCard, Store, Wallet } from 'lucide-react';
import { JSX } from 'react';
// hooks/use-duitku-payment.ts
import { useState } from 'react';
import axios from 'axios';

interface PaymentOrderDetails {
  paymentAmount: number;
  productDetails: string;
  email: string;
  paymentMethod: string;
  additionalParam?: Record<string, any>;
}

interface PaymentResponse {
  paymentUrl?: string;
  reference: string;
  statusCode: string;
  statusMessage: string;
}

// Display names for payment types
export const typeLabels: Record<string, string> = {
  'virtual-account': 'Virtual Account',
  'e-walet': 'E-Wallet',
  'convenience-store': 'Convenience Store',
};

// Icons for payment types
export const typeIcons: Record<string, JSX.Element> = {
  'virtual-account': <CreditCard className="h-5 w-5 text-blue-300" />,
  'e-walet': <Wallet className="h-5 w-5 text-blue-300" />,
  'convenience-store': <Store className="h-5 w-5 text-blue-300" />,
};

export function useDuitkuPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (
    orderDetails: PaymentOrderDetails
  ): Promise<PaymentResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/payment/initiate', orderDetails);
      return response.data;
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err?.response?.data?.message || 'Payment initiation failed');
      throw new Error(
        err?.response?.data?.message || 'Payment initiation failed'
      );
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

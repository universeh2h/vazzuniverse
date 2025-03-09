'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const merchantOrderId = searchParams.get('merchantOrderId');

  const [status, setStatus] = useState<
    'loading' | 'success' | 'failed' | 'pending'
  >('loading');
  const [statusMessage, setStatusMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (!merchantOrderId) {
      setStatus('failed');
      setStatusMessage('Invalid order reference');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(
          `/api/payment/check-status?merchantOrderId=${merchantOrderId}`
        );
        const data = response.data;

        setOrderDetails(data);

        if (data.statusCode === '00' || data.statusCode === '0') {
          setStatus('success');
          setStatusMessage('Payment completed successfully');
        } else if (data.statusCode === '01') {
          setStatus('pending');
          setStatusMessage('Payment is pending');
        } else {
          setStatus('failed');
          setStatusMessage(data.statusMessage || 'Payment failed');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('failed');
        setStatusMessage('Failed to check payment status');
      }
    };

    checkPaymentStatus();
  }, [merchantOrderId]);

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-blue-900/30 border border-blue-800 rounded-xl">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">
        Payment Status
      </h1>

      <div className="flex flex-col items-center justify-center mb-6">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        )}

        {status === 'success' && (
          <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
        )}

        {status === 'failed' && (
          <XCircle className="h-16 w-16 text-red-500 mb-2" />
        )}

        {status === 'pending' && (
          <Clock className="h-16 w-16 text-yellow-500 mb-2" />
        )}

        <p className="text-xl font-medium text-white">{statusMessage}</p>
      </div>

      {orderDetails && (
        <div className="mb-6 bg-blue-950/50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-100 mb-2">
            Order Details
          </h2>
          <div className="grid grid-cols-2 gap-2 text-blue-200">
            <div>Order ID:</div>
            <div className="text-right">{orderDetails.merchantOrderId}</div>

            {orderDetails.reference && (
              <>
                <div>Reference:</div>
                <div className="text-right">{orderDetails.reference}</div>
              </>
            )}

            {orderDetails.amount && (
              <>
                <div>Amount:</div>
                <div className="text-right">
                  Rp {parseInt(orderDetails.amount).toLocaleString()}
                </div>
              </>
            )}

            {orderDetails.productDetail && (
              <>
                <div>Product:</div>
                <div className="text-right">{orderDetails.productDetail}</div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

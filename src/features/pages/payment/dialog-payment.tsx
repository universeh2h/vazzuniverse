'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMidtransPayment } from '@/hooks/use-payment';
import { usePlansStore } from '@/hooks/use-select-plan';
import { Loader2 } from 'lucide-react';
import { FormatPrice } from '@/utils/formatPrice';
import { trpc } from '@/utils/trpc';

export function DialogPayment() {
  const { selectPlans, selectPayment, noWa, voucher } = usePlansStore();
  const payment = useMidtransPayment();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {} = trpc.voucher.validationVoucher.useQuery({
    code,
  });
  const handlePayment = async () => {
    if (!noWa || !selectPayment?.code || !selectPlans) {
      setError('Missing required payment information');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await payment.initiatePayment({
        noWa: noWa,
        paymentCode: selectPayment.code,
        layanan: selectPlans.layanan,
      });

      console.log('Payment response:', response);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-md transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
          Continue To Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#001435] border-2 border-blue-900 text-blue-100">
        <DialogHeader className="mb-4">
          <DialogTitle className="font-semibold text-blue-100">
            Payment Details
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Please review your payment details before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className=" p-4 border border-blue-700 rounded-lg bg-blue-900/30">
          <div className="grid grid-cols-2 gap-2 mt-2">
            <span className="text-blue-400">Payment Method:</span>
            <span className="font-medium text-blue-100">
              {selectPayment?.name}
            </span>

            <span className="text-blue-400">Product:</span>
            <span className="font-medium text-blue-100">
              {selectPlans?.layanan || 'N/A'}
            </span>

            <span className="text-blue-400">WhatsApp:</span>
            <span className="font-medium text-blue-100">
              {noWa || 'Not provided'}
            </span>

            <span className="text-blue-400">Amount:</span>
            <span className="font-medium text-blue-100">
              {FormatPrice(selectPayment?.price as number)}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-md text-red-300 text-sm mb-4">
            {error}
          </div>
        )}

        {paymentUrl && (
          <div className="p-3 bg-green-900/20 border border-green-800 rounded-md text-green-300 text-sm mb-4">
            Payment initiated successfully!
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-blue-400 hover:text-blue-300 underline"
            >
              Click here if you&apos;re not redirected automatically
            </a>
          </div>
        )}

        <Button
          onClick={handlePayment}
          disabled={isLoading || !noWa}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Proceed to Payment'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

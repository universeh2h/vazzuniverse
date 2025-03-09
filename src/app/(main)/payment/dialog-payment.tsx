import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDuitkuPayment } from '@/hooks/use-payment';
interface DialogPaymentProps {
  productName: string;
  amount: number;
  methodName: string;
  code: string;
}
export function DialogPayment({
  productName,
  amount,
  code,
  methodName,
}: DialogPaymentProps) {
  const { initiatePayment, isLoading } = useDuitkuPayment();

  const handlePayment = async () => {
    if (!methodName) {
      alert('Please select a payment method and enter your email');
      return;
    }

    try {
      const response = await initiatePayment({
        paymentAmount: amount * parseInt('20000'),
        productDetails: productName,
        email: 'wafiwafiwafi90@gmail.com',
        paymentMethod: code,
      });

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        alert(`Payment error: ${response.statusMessage}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Failed to initiate payment. Please try again.');
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="mt-4 bg-blue-600 hover:bg-blue-500 text-white py-2 px-6 rounded-md transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
          Continue To Payment
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="mt-6 p-4 border border-blue-700 rounded-lg bg-blue-900/30">
          <DialogTitle className="font-semibold mb-3 text-blue-100">
            Payment Details
          </DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            <span className="text-blue-300">
              You&apos;ve selected {methodName}
            </span>
            <span className="text-blue-300 mt-2">
              Amount to pay: Rp {amount.toLocaleString()}
            </span>
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handlePayment} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Bayar'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

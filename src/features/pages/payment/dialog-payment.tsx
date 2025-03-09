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
import { Method } from '@/hooks/use-select-plan';
import { Product } from '@/types/digiflazz/ml';
interface DialogPaymentProps {
  product: Product;
  amount: number;
  method: Method;
  noWa: string;
}
export function DialogPayment({
  product,
  amount,
  method,
  noWa,
}: DialogPaymentProps) {
  const payment = useMidtransPayment();
  const handlePayment = async () => {
    try {
      const response = await payment.initiatePayment({
        amount: amount,
        noWa,
        paymentMethod: 'gopay',
        productName: product.product_name,
      });
      console.log(response);
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
              You&apos;ve selected {method.name}
            </span>
            <span className="text-blue-300 mt-2">
              Amount to pay: Rp {amount.toLocaleString()}
            </span>
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handlePayment}>
          {/* {isLoading ? 'Processing...' : 'Bayar'} */}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

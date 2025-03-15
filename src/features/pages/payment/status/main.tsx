'use client';
import { trpc } from '@/utils/trpc';
import FlowProgress from './flow-number';
import { HeaderPaymentStatus } from './header';
import { useSearchParams } from 'next/navigation';
import { FLOWTRANSACTION, TransactionDetailsType } from '@/types/transaction';
import { TransactionDetails } from './transaction';

export function PaymentStatus() {
  const searchParams = useSearchParams();
  const merchantOrderId = searchParams.get('merchantOrderId') ?? '';
  const { data } = trpc.transaction.getTransaction.useQuery({
    merchantOrderId,
  });
  console.log(data);
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <HeaderPaymentStatus status={data?.paymentStatus as string} />
      <FlowProgress status={data?.paymentStatus as FLOWTRANSACTION} />
      {data && <TransactionDetails data={data as TransactionDetailsType} />}
    </main>
  );
}

'use client';
import { type JSX, useState } from 'react';
import { trpc } from '@/utils/trpc';
import Image from 'next/image';
import type { PaymentMethod } from '@/types/payment';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CreditCard, CheckCircle2, LockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typeIcons, typeLabels } from '@/hooks/use-payment';
import { Input } from '@/components/ui/input';
import { usePlansStore } from '@/hooks/use-select-plan';
import { FormatPrice } from '@/utils/formatPrice';
import { DialogPayment } from './dialog-payment';
import type { PlansProps } from '@/types/category';

export function PaymentsSection({
  amount,
}: {
  amount?: number;
  productDetails?: PlansProps | null;
}): JSX.Element {
  const { data: methods } = trpc.methods.getMethods.useQuery();
  const {
    noWa,
    setNowa,
    selectPayment,
    setSelectPayment,
    voucher,
    setVoucher,
  } = usePlansStore();
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const groupedMethods =
    methods?.data.reduce((acc, method) => {
      const type = method.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(method);
      return acc;
    }, {} as Record<string, PaymentMethod[]>) || {};

  const paymentTypes = Object.keys(groupedMethods);

  const handleSelectMethod = (method: PaymentMethod) => {
    if (!amount) return;

    setSelectPayment({
      code: method.code as string,
      price: amount,
      name: method.name,
      type: method.paymentType as string,
    });
  };

  // Handler untuk accordion yang hanya memungkinkan dibuka jika amount tersedia
  const handleAccordionChange = (value: string) => {
    if (!amount) return;
    setExpandedType(value === expandedType ? null : value);
  };

  return (
    <section className="w-full mx-auto p-6 bg-[#001435] border-2 border-blue-900 rounded-2xl mt-5 space-y-6 shadow-lg">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-blue-100 flex items-center gap-2">
          <span>💳</span>
          Pilih Metode Pembayaran
        </h2>
      </div>

      <div className="mb-4 space-y-2">
        <label
          htmlFor="whatsapp"
          className="block text-white text-sm mb-2 font-medium"
        >
          No Whatsapp
        </label>
        <Input
          type="number"
          id="whatsapp"
          value={noWa || ''}
          onChange={(e) => setNowa(e.target.value)}
          placeholder="Enter your no whatsapp"
          className="w-full px-4 py-3 rounded-md bg-blue-950 border border-blue-800 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          required
        />
      </div>

      <div className="mb-4 space-y-2">
        <label
          htmlFor="voucher"
          className="block text-white text-sm mb-2 font-medium"
        >
          Kode Voucher
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            id="voucher"
            value={voucher || ''}
            onChange={(e) => setVoucher(e.target.value)}
            placeholder="Masukkan kode voucher"
            className="w-full px-4 py-3 rounded-md bg-blue-950 border border-blue-800 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          />
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium text-sm transition-colors"
            onClick={() => {
              // Add voucher validation logic here
              if (voucher) {
                console.log('Validating voucher:', voucher);
              }
            }}
          >
            Terapkan
          </button>
        </div>
        {voucher && (
          <div className="text-xs text-blue-300 flex items-center gap-1 mt-1">
            <CheckCircle2 className="h-3 w-3 text-green-400" />
            Voucher &apos;{voucher}&apos; diterapkan
          </div>
        )}
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={expandedType || undefined}
        onValueChange={handleAccordionChange}
      >
        {paymentTypes.map((type) => (
          <div
            key={type}
            className={cn(!amount && 'opacity-60 pointer-events-none')}
          >
            <AccordionItem
              value={type}
              className="border border-blue-800 rounded-lg mb-4 overflow-hidden"
            >
              <AccordionTrigger
                className="px-4 py-4 bg-blue-900/50 hover:bg-blue-900/70 hover:no-underline text-blue-100 transition-all duration-200"
                disabled={!amount}
              >
                <div className="flex items-center gap-3">
                  {typeIcons[type] || (
                    <CreditCard className="h-5 w-5 text-blue-300" />
                  )}
                  <span className="font-medium">
                    {typeLabels[type] || type}
                  </span>
                  {amount && <span>{FormatPrice(amount as number)}</span>}

                  {!amount && (
                    <span className="ml-2 text-xs text-red-300 flex items-center gap-1">
                      <LockIcon className="h-3 w-3" />
                      Pilih Paket Dahulu
                    </span>
                  )}
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pt-3 pb-5 bg-blue-950/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedMethods[type].map((method) => (
                    <div
                      key={method.id}
                      className={cn(
                        'cursor-pointer border border-blue-800 hover:border-blue-400 rounded-lg w-full h-24 overflow-hidden relative bg-blue-950/20 transition-all duration-200',
                        selectPayment?.code === method.paymentCodeMidtrans &&
                          'border-blue-400 bg-blue-900/30'
                      )}
                      onClick={() => handleSelectMethod(method)}
                    >
                      <div className="h-full flex flex-row items-center p-3">
                        <div className="flex-shrink-0 flex items-center justify-center mr-3">
                          <Image
                            width={300}
                            height={300}
                            src={method.images}
                            alt={method.name}
                            className="size-12 object-contain"
                          />
                        </div>
                        <div className="flex-grow space-y-1">
                          <p className="text-sm font-medium text-blue-100">
                            {method.name}
                          </p>
                          {method.keterangan && (
                            <p className="text-xs text-blue-300">
                              {method.keterangan}
                            </p>
                          )}
                        </div>

                        {selectPayment?.code === method.code && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="h-5 w-5 text-blue-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </div>
        ))}
      </Accordion>

      {selectPayment && (
        <div className="transition-all duration-300 ease-in-out">
          <DialogPayment />
        </div>
      )}
    </section>
  );
}

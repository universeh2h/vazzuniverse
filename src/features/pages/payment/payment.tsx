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
import { motion, AnimatePresence } from 'framer-motion';
import { usePlansStore } from '@/hooks/use-select-plan';
import { FormatPrice } from '@/utils/formatPrice';
import { DialogPayment } from './dialog-payment';
import type { PlansProps } from '@/types/category';

const MotionPaymentOption = motion.div;
const MotionAccordionContent = motion(AccordionContent);

export function PaymentsSection({
  amount,
}: {
  amount?: number;
  productDetails?: PlansProps | null;
}): JSX.Element {
  const { data: methods } = trpc.methods.getMethods.useQuery();
  const { noWa, setNowa, selectPayment, setSelectPayment } = usePlansStore();
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
      code: method.paymentCodeMidtrans as string,
      price: amount,
      name: method.name,
      type: method.paymentType as string,
    });
  };

  // Payment Methods Preview for when no plan is selected
  const renderPaymentMethodsPreview = () => {
    return (
      <div className="space-y-6 mt-4">
        {paymentTypes.map((type) => (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              {typeIcons[type] || (
                <CreditCard className="h-4 w-4 text-blue-300" />
              )}
              <h4 className="text-sm font-medium text-blue-200">
                {typeLabels[type] || type}
              </h4>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {groupedMethods[type].map((method) => (
                <div
                  key={method.id}
                  className="relative flex flex-col items-center p-2 bg-blue-950/30 rounded-lg border border-blue-800 opacity-60"
                >
                  <div className="relative w-12 h-12 mb-1">
                    <Image
                      fill
                      src={method.images || '/placeholder.svg'}
                      alt={method.name}
                      className="object-contain filter grayscale"
                    />
                  </div>
                  <span className="text-xs text-blue-400 text-center truncate w-full">
                    {method.name.split(' ')[0]}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-950/60 rounded-lg">
                    <LockIcon className="w-5 h-5 text-blue-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!amount) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full mx-auto p-6 bg-[#001435] border-2 border-blue-900 rounded-2xl mt-5 space-y-6 shadow-lg"
      >
        <div className="text-center py-4">
          <div className="mb-4 text-blue-300">
            <CreditCard className="mx-auto h-12 w-12 opacity-50" />
          </div>
          <h3 className="text-xl font-medium text-blue-100 mb-2">
            Pilih Paket Terlebih Dahulu
          </h3>
          <p className="text-blue-300 max-w-md mx-auto mb-4">
            Anda perlu memilih paket dari daftar yang tersedia sebelum dapat
            menggunakan metode pembayaran.
          </p>
        </div>

        <div className="border-t border-blue-800 pt-4">
          <h4 className="text-sm text-blue-300 mb-2 flex items-center gap-2">
            <LockIcon className="w-4 h-4" />
            Metode Pembayaran Tersedia:
          </h4>
          {renderPaymentMethodsPreview()}
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto p-6 bg-[#001435] border-2 border-blue-900 rounded-2xl mt-5 space-y-6 shadow-lg"
    >
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-blue-100 flex items-center gap-2">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, delay: 0.3 }}
          >
            💳
          </motion.span>
          Pilih Metode Pembayaran
        </h2>
      </motion.div>

      <motion.div
        className="mb-4 space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
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
      </motion.div>

      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={expandedType || undefined}
        onValueChange={(value) => setExpandedType(value || null)}
      >
        {paymentTypes.map((type, index) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <AccordionItem
              value={type}
              className="border border-blue-800 rounded-lg mb-4 overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-4 bg-blue-900/50 hover:bg-blue-900/70 hover:no-underline text-blue-100 transition-all duration-200">
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {typeIcons[type] || (
                    <CreditCard className="h-5 w-5 text-blue-300" />
                  )}
                  <span className="font-medium">
                    {typeLabels[type] || type}
                  </span>
                  <span>{FormatPrice(amount)}</span>
                </motion.div>
              </AccordionTrigger>

              <MotionAccordionContent
                className="px-4 pt-3 pb-5 bg-blue-950/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                >
                  <AnimatePresence>
                    {groupedMethods[type].map((method) => (
                      <MotionPaymentOption
                        key={method.id}
                        className={cn(
                          'cursor-pointer border border-blue-800 hover:border-blue-400 rounded-lg w-full h-24 overflow-hidden relative bg-blue-950/20',
                          selectPayment?.code === method.paymentCodeMidtrans &&
                            'border-blue-400 bg-blue-900/30'
                        )}
                        onClick={() => handleSelectMethod(method)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{
                          scale: 1.03,
                          boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        <div className="h-full flex flex-row items-center p-3">
                          <motion.div
                            className="flex-shrink-0 flex items-center justify-center mr-3"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Image
                              width={300}
                              height={300}
                              src={method.images || '/placeholder.svg'}
                              alt={method.name}
                              className="size-12 object-contain"
                            />
                          </motion.div>
                          <motion.div
                            className="flex-grow space-y-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <p className="text-sm font-medium text-blue-100">
                              {method.name}
                            </p>
                            {method.keterangan && (
                              <p className="text-xs text-blue-300">
                                {method.keterangan}
                              </p>
                            )}
                          </motion.div>

                          {selectPayment?.code === method.code && (
                            <motion.div
                              className="absolute top-2 right-2"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                            >
                              <CheckCircle2 className="h-5 w-5 text-blue-400" />
                            </motion.div>
                          )}
                        </div>
                      </MotionPaymentOption>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </MotionAccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
      <AnimatePresence>
        {selectPayment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <DialogPayment />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

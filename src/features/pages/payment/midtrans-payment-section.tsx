'use client';
import { Fragment, type JSX, useState } from 'react';
import { trpc } from '@/utils/trpc';
import Image from 'next/image';
import type { PaymentMethod } from '@/types/payment';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typeIcons, typeLabels } from '@/hooks/use-payment';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlansStore } from '@/hooks/use-select-plan';
import { FormatPrice } from '@/utils/formatPrice';
import { DialogPayment } from './dialog-payment';
import type { PlansProps } from '@/types/category';

const MotionPaymentOption = motion.div;

export function PaymentsSection({
  amount,
}: {
  amount?: number;
  productDetails?: PlansProps | null;
}): JSX.Element {
  const { data: methods } = trpc.methods.getMethods.useQuery();
  const { noWa, setNowa, selectPayment, setSelectPayment } = usePlansStore();
  const [activeType, setActiveType] = useState<string | null>(null);

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

  const handleSelectType = (type: string) => {
    if (!amount) return;
    setActiveType(type === activeType ? null : type);
  };

  // Common section structure for both with and without amount
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

      {amount && (
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
      )}

      <div className="space-y-4">
        {paymentTypes.map((type, index) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <div
              className={cn(
                'border border-blue-800 rounded-lg mb-4 overflow-hidden',
                !amount && 'opacity-70'
              )}
            >
              <motion.div
                className={cn(
                  'px-4 py-4 bg-blue-900/50 text-blue-100 transition-all duration-200',
                  amount
                    ? 'hover:bg-blue-900/70 cursor-pointer'
                    : 'cursor-not-allowed'
                )}
                onClick={() => handleSelectType(type)}
                whileHover={amount ? { scale: 1.01 } : {}}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {typeIcons[type] || (
                      <CreditCard className="h-5 w-5 text-blue-300" />
                    )}
                    <span className="font-medium">
                      {typeLabels[type] || type}
                    </span>
                  </div>
                  {amount && <span>{FormatPrice(amount)}</span>}
                </div>
              </motion.div>

              {/* Payment methods display area */}
              <div className="p-2">
                {/* If no amount, just show logos in a grid */}
                {!amount && (
                  <div className="flex justify-end gap-3 ">
                    {groupedMethods[type].map((method) => (
                      <Fragment key={method.id}>
                        <Image
                          width={64}
                          height={64}
                          src={method.images}
                          alt={method.name}
                          className="h-10 w-16 object-contain "
                        />
                      </Fragment>
                    ))}
                  </div>
                )}

                {/* If amount exists and type is active, show selectable payment methods */}
                <AnimatePresence>
                  {amount && activeType === type && (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                    >
                      {groupedMethods[type].map((method) => (
                        <MotionPaymentOption
                          key={method.id}
                          className={cn(
                            'cursor-pointer border border-blue-800 hover:border-blue-400 rounded-lg w-full h-24 overflow-hidden relative bg-blue-950/20',
                            selectPayment?.code ===
                              method.paymentCodeMidtrans &&
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

                            {selectPayment?.code ===
                              method.paymentCodeMidtrans && (
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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

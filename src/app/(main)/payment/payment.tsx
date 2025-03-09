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
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typeIcons, typeLabels } from '@/hooks/use-payment';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { DialogPayment } from './dialog-payment';

const MotionCard = motion(Card);
const MotionAccordionContent = motion(AccordionContent);

export function PaymentsSection({
  amount,
  productDetails,
}: {
  amount: number;
  productDetails: string;
}): JSX.Element {
  const { data: methods } = trpc.methods.getMethods.useQuery();
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [whatsapp, setWhatsapp] = useState<string>('');
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

  const handleSelectMethod = (id: number) => {
    setSelectedMethod(id === selectedMethod ? null : id);
  };

  const paymentName = methods?.data.find((m) => m.id === selectedMethod)?.name;
  const paymentCode = methods?.data.find((m) => m.id === selectedMethod)?.code;

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
          type="text"
          id="whatsapp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
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
                  className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                >
                  <AnimatePresence>
                    {groupedMethods[type].map((method) => (
                      <MotionCard
                        key={method.id}
                        className={cn(
                          'cursor-pointer border border-blue-800 hover:border-blue-400 rounded-lg w-full h-auto overflow-hidden relative',
                          selectedMethod === method.id &&
                            'border-blue-400 bg-blue-900/30'
                        )}
                        onClick={() => handleSelectMethod(method.id)}
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
                        <CardContent className="h-full flex flex-col p-3">
                          <div className="flex flex-col h-full">
                            <motion.div
                              className="flex-grow flex items-center justify-center py-2"
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Image
                                width={300}
                                height={300}
                                src={method.images || '/placeholder.svg'}
                                alt={method.name}
                                className="size-16 object-contain"
                              />
                            </motion.div>
                            <motion.div
                              className="text-center space-y-1 mt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <p className="text-sm  font-medium text-blue-900">
                                {method.name}
                              </p>
                              {method.keterangan && (
                                <p className="text-xs text-blue-300">
                                  {method.keterangan}
                                </p>
                              )}
                            </motion.div>
                          </div>

                          {selectedMethod === method.id && (
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
                        </CardContent>
                      </MotionCard>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </MotionAccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>

      <AnimatePresence>
        {selectedMethod && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <DialogPayment
              amount={amount}
              productName={productDetails}
              methodName={paymentName as string}
              code={paymentCode as string}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

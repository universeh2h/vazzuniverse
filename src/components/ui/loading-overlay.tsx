'use client';
import { motion } from 'framer-motion';
import { Loader2Icon } from 'lucide-react';
export const LoadingOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
    <motion.div
      className="flex flex-col items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Loader2Icon
        className="w-12 h-12 text-primary animate-spin"
        strokeWidth={2}
      />
      <p className="mt-4 text-gray-600 text-sm font-medium">Memuat konten...</p>
    </motion.div>
  </div>
);

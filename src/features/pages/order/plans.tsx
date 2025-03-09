'use client';

import type { Product } from '@/types/digiflazz/ml';
import type { JSX } from 'react';
import { FormatPrice } from '@/utils/formatPrice';

export function PlansOrder({
  plan,
  onSelect,
  isSelected,
}: {
  plan: Product;
  onSelect: (select: Product) => void;
  isSelected?: boolean;
}): JSX.Element {
  return (
    <section
      onClick={() => onSelect(plan)}
      className={`cursor-pointer rounded-xl border transition-all duration-300 relative ${
        isSelected
          ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 shadow-lg shadow-blue-900/30'
          : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-blue-500 hover:shadow-md hover:shadow-blue-900/20'
      }`}
    >
      {/* Seal Badge for Selected Item */}
      {isSelected && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-60"></div>
            <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-lg">
              Selected
            </div>
          </div>
        </div>
      )}

      <div className="px-3 py-2 space-y-2">
        {/* Diamond Icon and Product Name */}
        <div className="flex items-center gap-2 mt-2">
          <h3
            className={`font-medium text-xs ${
              isSelected ? 'text-white' : 'text-gray-200'
            }`}
          >
            {plan.product_name}
          </h3>
        </div>

        {/* Price */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-400">Price</p>
            <p
              className={`font-semibold text-sm ${
                isSelected ? 'text-white' : 'text-gray-200'
              }`}
            >
              {FormatPrice(plan.price)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

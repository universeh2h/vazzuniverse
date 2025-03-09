import { Product } from '@/types/digiflazz/ml';
import { JSX } from 'react';
import { FormatPrice } from '@/utils/formatPrice';

export function PlansOrder({
  plan,
  onSelect,
  isSelected,
}: {
  plan: Product;
  onSelect: (select: string) => void;
  isSelected?: boolean;
}): JSX.Element {
  const displayName = () => {
    if (plan.product_name.includes('Weekly Diamond Pass')) {
      return 'Weekly Diamond Pass';
    }
    return plan.product_name.replace('Mobile Legends ', ' ');
  };
  return (
    <section
      onClick={() => onSelect(plan.buyer_sku_code)}
      className={`cursor-pointer rounded-xl border transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 shadow-lg shadow-blue-900/30'
          : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-blue-500 hover:shadow-md hover:shadow-blue-900/20'
      }`}
    >
      <div className="px-3 py-2 space-y-2">
        {/* Product Type Badge */}
        <div className="flex justify-between items-start">
          {isSelected && (
            <span className="rounded-full bg-blue-400 p-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>

        {/* Diamond Icon and Product Name */}
        <div className="flex items-center gap-2">
          <h3
            className={`font-medium text-xs ${
              isSelected ? 'text-white' : 'text-gray-200'
            }`}
          >
            {displayName()}
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

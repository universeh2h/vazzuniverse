import { Product } from '@/types/digiflazz/ml';
import { useState, useEffect } from 'react';
import { PlansOrder } from './plans';
import { Button } from '@/components/ui/button';
import { SubCategories } from '@/types/category';
import { usePlansStore } from '@/hooks/use-select-plan';

interface OrderPageProps {
  plans: Product[];
  subCategories: SubCategories[];
}

export function OrderPage({ plans, subCategories }: OrderPageProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<SubCategories | null>(null);
  const { selectPlans, setSelectPlans } = usePlansStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!Array.isArray(plans) || plans.length === 0) return;

    if (subCategories && subCategories.length > 0) {
      setSelectedCategory(subCategories[0]);
    }

    const sortedProducts = [...plans].sort((a, b) => a.price - b.price);
    setFilteredProducts(sortedProducts);
  }, [plans, subCategories]);

  useEffect(() => {
    if (!Array.isArray(plans) || plans.length === 0) return;

    if (!selectedCategory || subCategories.length === 0) {
      const allProducts = [...plans].sort((a, b) => a.price - b.price);
      setFilteredProducts(allProducts);
      return;
    }

    const filtered = plans.filter((plan) => {
      return plan.buyer_sku_code.includes(selectedCategory.code);
    });

    const sorted = filtered.sort((a, b) => a.price - b.price);
    setFilteredProducts(sorted);
  }, [selectedCategory, plans, subCategories]);

  const handleCategoryChange = (category: SubCategories) => {
    setSelectedCategory(category);
    setSelectPlans(null);
  };

  const handleSelect = (select: Product) => {
    setSelectPlans(select);
  };

  return (
    <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-800/50 space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Pilih Package</h2>

      {/* Category selection - only show if subcategories exist */}
      {subCategories && subCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subCategories.map((category) => (
            <Button
              key={category.id}
              className={`bg-blue-800 rounded-full hover:bg-blue-700 ${
                selectedCategory?.id === category.id ? 'bg-blue-500' : ''
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
          filteredProducts.map((plan, idx) => (
            <PlansOrder
              key={`${plan.buyer_sku_code}-${idx}`}
              plan={plan}
              onSelect={handleSelect}
              isSelected={selectPlans?.buyer_sku_code === plan.buyer_sku_code}
            />
          ))
        ) : (
          <p className="text-white col-span-3 text-center py-4">
            No products available for this category
          </p>
        )}
      </div>
    </div>
  );
}

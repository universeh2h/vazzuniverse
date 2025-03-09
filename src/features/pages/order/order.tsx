import { Product } from '@/types/digiflazz/ml';
import { useState, useEffect } from 'react';
import { PlansOrder } from './plans';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { SubCategories } from '@/types/category';

interface OrderPageProps {
  plans: Product[];
  subCategories: SubCategories[];
}

export function OrderPage({ plans, subCategories }: OrderPageProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<SubCategories | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Set initial products and selected category
  useEffect(() => {
    // Safety check to ensure plans is an array
    if (!Array.isArray(plans)) return;

    if (subCategories && subCategories.length > 0) {
      setSelectedCategory(subCategories[0]);
    } else {
      // If no subcategories, show all products sorted
      const sortedProducts = [...plans].sort((a, b) => {
        const numA = parseInt(a.product_name.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.product_name.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      });
      setFilteredProducts(sortedProducts);
    }
  }, [subCategories, plans]);

  // Filter products when category changes
  useEffect(() => {
    // Safety check to ensure plans is an array
    if (!Array.isArray(plans)) return;

    // If no selected category or no subcategories, show all products
    if (!selectedCategory || subCategories.length === 0) {
      const sortedProducts = [...plans].sort((a, b) => {
        const numA = parseInt(a.product_name.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.product_name.match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      });
      setFilteredProducts(sortedProducts);
      return;
    }

    // Simply filter products by matching category ID
    const filtered = plans.filter((plan) => {
      // Your products should have a way to identify which category they belong to
      // This is a simplified example - adjust to match your data structure
      return plan.category === selectedCategory.name;
    });

    // Sort the filtered products by numeric value in product name
    const sorted = filtered.sort((a, b) => {
      const numA = parseInt(a.product_name.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.product_name.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

    setFilteredProducts(sorted);
  }, [selectedCategory, plans, subCategories]);

  // Function to handle category selection
  const handleCategoryChange = (category: SubCategories) => {
    setSelectedCategory(category);
    setSelectedPlan(null); // Reset selected plan when category changes
  };

  // Function to handle plan selection
  const handleSelect = (select: string) => {
    setSelectedPlan(select);
  };

  return (
    <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-800/50 space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Select Package</h2>

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
              key={`${plan.product_name}-${idx}`}
              plan={plan}
              onSelect={handleSelect}
              isSelected={selectedPlan === plan.buyer_sku_code}
            />
          ))
        ) : (
          <p className="text-white col-span-3 text-center py-4">
            No products available
          </p>
        )}
      </div>
    </div>
  );
}

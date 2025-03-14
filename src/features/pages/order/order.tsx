import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlansOrder } from './plans';
import { usePlansStore } from '@/hooks/use-select-plan';
import { PlansProps, SubCategories } from '@/types/category';

interface OrderPageProps {
  plans: PlansProps[];
  subCategories: SubCategories[];
}

//// Helper untuk mencocokkan produk dengan kategori
const matchProductToCategory = (
  plan: PlansProps,
  category: SubCategories
): boolean => {
  // Case 1: Top-up adalah kategori khusus
  if (
    category.name.toLowerCase() === 'top-up' ||
    category.code?.toLowerCase() === 'top-up'
  ) {
    // Untuk top-up, gunakan logika khusus jika perlu
    return true;
  }

  // Case 2: Periksa subCategoryId jika tersedia dan valid
  if (plan.subCategoryId && category.id) {
    if (Number(plan.subCategoryId) === Number(category.id)) {
      return true;
    }
  }

  // Case 3: Periksa berdasarkan layanan jika mengandung "GB" dan kategori adalah data/internet
  if (
    (plan.layanan && category.code?.toLowerCase() === 'data') ||
    category.name.toLowerCase().includes('data') ||
    category.name.toLowerCase().includes('internet')
  ) {
    const layananLower = String(plan.layanan).toLowerCase();
    if (
      layananLower.includes('gb') ||
      layananLower.includes('data') ||
      layananLower.includes('internet')
    ) {
      return true;
    }
  }

  // Case 4: Periksa berdasarkan providerId dan code
  if (plan.providerId && category.code) {
    const providerIdLower = String(plan.providerId).toLowerCase();
    const categoryCodeLower = String(category.code).toLowerCase();

    const categoryMappings: Record<string, string[]> = {
      pulsa: ['pulsa', 'pls', 'credit', 'pulsa transfer'],
      data: ['data', 'internet', 'gb', 'mb', 'adb', 'max', 'alwayson', 'combo'],
      voucher: ['voucher', 'vcr', 'vch'],
      game: ['game', 'games', 'gmg'],
      pln: ['pln', 'listrik', 'electric'],
      pakettelp: ['telp', 'call', 'voice', 'telpn'],
    };

    // Periksa berdasarkan mapping
    if (categoryMappings[categoryCodeLower]) {
      return categoryMappings[categoryCodeLower].some((keyword) =>
        providerIdLower.includes(keyword)
      );
    }

    // Fallback ke pengecekan umum
    return (
      providerIdLower.includes(categoryCodeLower) ||
      categoryCodeLower.includes(providerIdLower)
    );
  }

  return false;
};

export function OrderPage({ plans, subCategories }: OrderPageProps) {
  // States
  const [selectedCategory, setSelectedCategory] =
    useState<SubCategories | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<PlansProps[]>([]);
  const [effectiveSubCategories, setEffectiveSubCategories] = useState<
    SubCategories[]
  >([]);
  const { selectPlans, setSelectPlans } = usePlansStore();

  // Create memoized default Top-up category
  const defaultTopUpCategory = useMemo(
    () => ({
      name: 'Top-up',
      id: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      code: 'top-up',
      categoriesId: 0,
      active: true,
    }),
    []
  );

  // Process subcategories - this runs only when subCategories prop changes
  useEffect(() => {
    if (!subCategories || subCategories.length === 0) {
      setEffectiveSubCategories([defaultTopUpCategory]);
      return;
    }

    const hasTopUp = subCategories.some(
      (cat) =>
        cat.name.toLowerCase() === 'top-up' ||
        cat.code?.toLowerCase() === 'top-up'
    );

    const processed = hasTopUp
      ? [...subCategories]
      : [...subCategories, defaultTopUpCategory];

    setEffectiveSubCategories(processed);
  }, [subCategories, defaultTopUpCategory]);

  useEffect(() => {
    if (effectiveSubCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(effectiveSubCategories[0]);
    }
  }, [effectiveSubCategories, selectedCategory]);

  useEffect(() => {
    if (!selectedCategory || !Array.isArray(plans)) {
      return;
    }

    let filtered: PlansProps[] = [];

    if (
      selectedCategory.id === 0 ||
      selectedCategory.name.toLowerCase() === 'top-up'
    ) {
      // Logika untuk Top-up (semua produk yang tidak masuk kategori lain)
      const realCategoryIds = effectiveSubCategories
        .filter((cat) => cat.id !== 0 && cat.name.toLowerCase() !== 'top-up')
        .map((cat) => cat.id);

      filtered = plans.filter(
        (plan) => !realCategoryIds.includes(Number(plan.subCategoryId))
      );
    } else {
      // Logika untuk kategori lainnya
      filtered = plans.filter((plan) =>
        matchProductToCategory(plan, selectedCategory)
      );
    }

    console.log('Filtered products for', selectedCategory.name, ':', filtered);
    setFilteredProducts(filtered);
  }, [selectedCategory, plans, effectiveSubCategories]);

  const handleCategoryChange = (category: SubCategories) => {
    setSelectedCategory(category);
    setSelectPlans(null);
  };

  const handleSelect = (plan: PlansProps) => {
    setSelectPlans(plan);
  };

  return (
    <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-800/50 space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Pilih Package</h2>

      {/* Category selection */}
      {effectiveSubCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {effectiveSubCategories.map((category) => (
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
              key={`${plan.providerId || plan.id}-${idx}`}
              plan={plan}
              onSelect={handleSelect}
              isSelected={selectPlans?.providerId === plan.providerId}
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

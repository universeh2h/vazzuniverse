import { BRAND_SKU_MAPPING } from '@/data/data-sku-digiflazz';
import { Product } from '@/types/digiflazz/ml';

export function filterProductsByGame(
  products: Product[],
  gameName: string
): Product[] {
  const lowerGameName = gameName.toLowerCase();
  const skuCode = BRAND_SKU_MAPPING[lowerGameName];
  const formattedGameName = lowerGameName.replace(/-/g, ' ');

  return products.filter((product: Product) => {
    const productNameLower = product.product_name.toLowerCase();
    const brandLower = product.brand?.toLowerCase() || '';
    const categoryLower = product.category?.toLowerCase() || '';
    const skuCodeLower = product.buyer_sku_code.toLowerCase();

    if (
      productNameLower.includes(formattedGameName) ||
      (skuCode && skuCodeLower.includes(skuCode))
    ) {
      return true;
    }
    if (brandLower === formattedGameName) {
      return true;
    }

    if (categoryLower === formattedGameName) {
      return true;
    }
    if (skuCode && skuCodeLower.startsWith(skuCode)) {
      return true;
    }

    return false;
  });
}

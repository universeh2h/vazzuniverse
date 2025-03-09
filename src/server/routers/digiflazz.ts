import { Digiflazz } from '@/lib/digiflazz';
import { publicProcedure, router } from '../trpc';
import { Product } from '@/types/digiflazz/ml';
import { z } from 'zod';
const BRAND_SKU_MAPPING: Record<string, string> = {
  'mobile-legends': 'ml',
  'mobile-legends-bang bang': 'ml',
  'arena-breakout': 'ab',
  'ace-racer': 'ac',
  'astral-guardians': 'ag',
  'free-fire': 'ff',
  'pubg-mobile': 'pubgm',
  'call-of-duty-mobile': 'codm',
  'genshin-impact': 'gi',
};
function filterProductsByGame(
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

export const digiflazz = router({
  getProductsByGame: publicProcedure
    .input(
      z.object({
        game: z.string(),
      })
    )
    .query(async ({ input }): Promise<Product[]> => {
      const username = process.env.DIGI_USERNAME as string;
      const apiKey = process.env.DIGI_API_KEY as string;
      const digiflazz = new Digiflazz(username, apiKey);

      try {
        // Get the full price list
        const result = await digiflazz.checkPrice();

        if (result && result.data) {
          const filteredProducts = filterProductsByGame(
            result.data,
            input.game
          );
          return filteredProducts;
        }

        return [];
      } catch (priceError) {
        try {
          const prepaidResult = await digiflazz.checkPricePrepaid();

          if (prepaidResult && prepaidResult.data) {
            // Filter products by game name from prepaid result
            const filteredProducts = filterProductsByGame(
              prepaidResult.data,
              input.game
            );
            return filteredProducts;
          }

          return [];
        } catch (prepaidError) {
          // If both price checks fail, at least check deposit to verify credentials
          await digiflazz.checkDeposit();
          return [];
        }
      }
    }),
  getAllGames: publicProcedure.query(async (): Promise<string[]> => {
    const username = process.env.DIGI_USERNAME as string;
    const apiKey = process.env.DIGI_API_KEY as string;
    const digiflazz = new Digiflazz(username, apiKey);

    try {
      // Get the full price list
      const result = await digiflazz.checkPrice();

      if (result && result.data) {
        // Extract unique brands that are games
        const gameSet = new Set<string>();

        result.data.forEach((product: Product) => {
          if (product.category?.toLowerCase() === 'games' && product.brand) {
            gameSet.add(product.brand);
          }
        });

        return Array.from(gameSet);
      }

      return [];
    } catch (priceError) {
      try {
        const prepaidResult = await digiflazz.checkPricePrepaid();

        if (prepaidResult && prepaidResult.data) {
          // Extract unique brands that are games
          const gameSet = new Set<string>();

          prepaidResult.data.forEach((product: Product) => {
            if (product.category?.toLowerCase() === 'games' && product.brand) {
              gameSet.add(product.brand);
            }
          });

          return Array.from(gameSet);
        }

        return [];
      } catch (prepaidError) {
        return [];
      }
    }
  }),
  getSubCategories: publicProcedure
    .input(
      z.object({
        categoryId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const data = await ctx.prisma.subCategories.findMany({
          where: {
            categoriesId: input.categoryId,
            active: true, // Only get active subcategories
          },
        });
        return data;
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching subcategories:', error.message);
        }
        throw new Error('Failed to fetch subcategories');
      }
    }),

  // Keep the existing procedure for specific Mobile Legends case
  getMobileLegendsPrice: publicProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ input }): Promise<Product[]> => {
      const username = process.env.DIGI_USERNAME as string;
      const apiKey = process.env.DIGI_API_KEY as string;
      const digiflazz = new Digiflazz(username, apiKey);

      try {
        // Get the full price list
        const result = await digiflazz.checkPrice();

        // Filter only Mobile Legends products
        if (result && result.data) {
          const mlbbProducts = result.data.filter((product: Product) => {
            return (
              product.product_name.toLowerCase().includes('mobile legends') ||
              product.buyer_sku_code.toLowerCase().includes('ml') ||
              product.category.toLowerCase().includes('mobile legends')
            );
          });

          return mlbbProducts;
        }

        return [];
      } catch (priceError) {
        try {
          const prepaidResult = await digiflazz.checkPricePrepaid();

          // Filter only Mobile Legends products from prepaid result
          if (prepaidResult && prepaidResult.data) {
            const mlbbProducts = prepaidResult.data.filter(
              (product: Product) => {
                return (
                  product.product_name
                    .toLowerCase()
                    .includes('mobile legends') ||
                  product.buyer_sku_code.toLowerCase().includes('ml') ||
                  product.category.toLowerCase().includes('mobile legends')
                );
              }
            );

            return mlbbProducts;
          }

          return [];
        } catch (prepaidError) {
          // If both price checks fail, at least check deposit to verify credentials
          await digiflazz.checkDeposit();
          return [];
        }
      }
    }),
});

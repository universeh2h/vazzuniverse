import { Digiflazz } from '@/lib/digiflazz';
import { publicProcedure, router } from '../trpc';
import { Product } from '@/types/digiflazz/ml';
import { z } from 'zod';
import { filterProductsByGame } from '@/utils/digiflazz-filter';

export const digiflazz = router({
  getProductsByGame: publicProcedure
    .input(
      z.object({
        game: z.string(),
      })
    )
    .query(async ({ ctx, input }): Promise<Product[]> => {
      const username = process.env.DIGI_USERNAME as string;
      const apiKey = process.env.DIGI_API_KEY as string;
      const digiflazz = new Digiflazz(username, apiKey);
      try {
        // Get the full price list
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
          console.error('error ', priceError);

          return [];
        } catch (prepaidError) {
          // If both price checks fail, at least check deposit to verify credentials
          await digiflazz.checkDeposit();
          console.error('error ', prepaidError);

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
        console.error('error ', priceError);

        return [];
      } catch (prepaidError) {
        console.error('error ', prepaidError);

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
            active: true,
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
});

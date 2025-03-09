import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
export const mainRouter = router({
  getBanners: publicProcedure.query(async ({ ctx }) => {
    try {
      const banners = await ctx.prisma.berita.findMany();
      return {
        statusCode: 200,
        message: 'Banners fetched successfully',
        data: banners,
      };
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw new Error('Failed to fetch banners');
    }
  }),
  getCategoriesByName: publicProcedure
    .input(
      z.object({
        kode: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const categories = await ctx.prisma.categories.findFirst({
          where: {
            kode: input.kode,
          },
        });

        const subCategories = await ctx.prisma.subCategories.findMany({
          where: {
            categoriesId: categories?.id,
          },
        });

        return { categories, subCategories };
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        throw new Error('Failed to fetch  categories');
      }
    }),
  getCategoriesType: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.categories.findMany({
        select: {
          type: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      throw new Error('Failed to fetch  categories');
    }
  }),
  getCategoriesActive: publicProcedure
    .input(
      z.object({
        type: z.string(),
        page: z.string().transform((val) => parseInt(val, 10) || 1),
        perPage: z.string().transform((val) => parseInt(val, 10) || 10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const skip = (input.page - 1) * input.perPage;

        // Get paginated data
        const categories = await ctx.prisma.categories.findMany({
          where: { type: input.type },
          skip,
          take: input.perPage,
          orderBy: { id: 'asc' },
        });

        const totalCount = await ctx.prisma.categories.count({
          where: { type: input.type },
        });

        const totalPages = Math.ceil(totalCount / input.perPage);

        return {
          data: categories,
          meta: {
            currentPage: input.page,
            perPage: input.perPage,
            totalCount,
            totalPages,
            hasNextPage: input.page < totalPages,
            hasPreviousPage: input.page > 1,
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        throw new Error('Failed to fetch active categories');
      }
    }),
  getCategoriesPopular: publicProcedure.query(async ({ ctx }) => {
    try {
      const categories = await ctx.prisma.categories.findMany({
        where: {
          type: 'populer',
        },
      });
      return categories;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      throw new Error('failed to fetch categories popular');
    }
  }),
  getCategories: publicProcedure.query(async ({ ctx }) => {
    try {
      const categories = await ctx.prisma.categories.findMany();
      return {
        statusCode: 200,
        message: 'Categories fetched successfully',
        data: categories,
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }),
});

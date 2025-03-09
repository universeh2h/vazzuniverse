import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const Layanans = router({
  getLayanans: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        status: z.string().optional(),
        page: z.string().transform((val) => parseInt(val, 10) || 1),
        perPage: z.string().transform((val) => parseInt(val, 10) || 10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const skip = (input.page - 1) * input.perPage;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        // Add search filter
        if (input.search) {
          where.layanan = {
            contains: input.search,
          };
        }

        // Add category filter
        if (input.category) {
          where.category = input.category;
        }

        // Add status filter
        if (input.status) {
          where.status = input.status;
        }

        // Execute query with filters
        const data = await ctx.prisma.layanan.findMany({
          where,
          skip,
          take: input.perPage,
          orderBy: {
            layanan: 'asc', // Default ordering
          },
          select: {
            id: true,
            layanan: true,
            harga: true,
            status: true,
          },
        });

        // Get total count for pagination info (optional)
        const totalCount = await ctx.prisma.layanan.count({ where });

        return {
          data,
          pagination: {
            total: totalCount,
            page: input.page,
            perPage: input.perPage,
            pageCount: Math.ceil(totalCount / input.perPage),
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          console.error('error : ', error.message);
        }
        console.error('error fetching layanans');
        return {
          data: [],
          pagination: {
            total: 0,
            page: input.page,
            perPage: input.perPage,
            pageCount: 0,
          },
        };
      }
    }),

  getLayananByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const category = await ctx.prisma.categories.findFirst({
          where: { kode: input.category },
        });
        const subCategories = await ctx.prisma.subCategories.findMany({
          where: {
            categoriesId: category?.id,
          },
        });
        const data = await ctx.prisma.layanan.findMany({
          where: {
            kategoriId: category?.id.toString(),
          },
          select: {
            layanan: true,
            harga: true,
          },
          orderBy: {
            harga: 'asc',
          },
        });
        return {
          layanan: data,
          subCategories,
        };
      } catch (error) {
        if (error instanceof Error) {
          console.error('error : ', error.message);
        }
        console.error('error fetching layanans');
      }
    }),
});

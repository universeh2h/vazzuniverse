/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { Prisma } from "@prisma/client";
import { layananFormSchema } from "@/types/layanans";

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

        const where: Prisma.LayananWhereInput = {};

        // Add search filter
        if (input.search) {
          where.layanan = {
            contains: input.search,
          };
        }

        // Add status filter
        if (input.status) {
          where.status = input.status === "active" ? true : false;
        }

        // Execute query with filters
        const data = await ctx.prisma.layanan.findMany({
          where,
          skip,
          take: input.perPage,
          orderBy: {
            layanan: "asc", // Default ordering
          },
          select: {
            id: true,
            layanan: true,
            hargaPlatinum: true,
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
          console.error("error : ", error.message);
        }
        console.error("error fetching layanans");
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
  getAll: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        page: z.number(),
        limit: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, limit = 10, page = 1, status } = input;
      const skip = (page - 1) * limit;

      let whereConditions = [];
      let params = [];

      if (search) {
        whereConditions.push(`(layanan LIKE ? OR provider_id LIKE ?)`);
        params.push(`%${search}%`, `%${search}%`);
      }

      if (status) {
        whereConditions.push(`status = ?`);
        params.push(status === "active" ? 1 : 0);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Count query
      const countQuery = `SELECT COUNT(*) as total FROM layanans ${whereClause}`;
      const countResult = await ctx.prisma.$queryRawUnsafe<{ total: number }[]>(
        countQuery,
        ...params
      );

      // Data query
      const dataQuery = `
    SELECT 
      id,
      harga,
      harga_platinum AS hargaPlatinum,
      profit_platinum AS profitPlatinum,
      purchase_price AS hargaBeli,
      status,
      layanan,
      provider_id AS productCode,
      expired_flash_sale AS expiredFlashSale,
      catatan,
      provider
    FROM layanans 
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

      const result = await ctx.prisma.$queryRawUnsafe(
        dataQuery,
        ...params,
        limit,
        skip
      );

      return {
        data: result,
        pagination: {
          page,
          limit,
          total: Number(countResult[0]?.total || 0),
          totalPages: Math.ceil(Number(countResult[0]?.total || 0) / limit),
        },
      };
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
        const subCategories = await ctx.prisma.subCategory.findMany({
          where: {
            categoryId: category?.id,
            active: true,
          },
        });
        const data = await ctx.prisma.layanan.findMany({
          where: {
            AND : [
              {
                kategoriId: category?.id,
              },
              {
                status : true
              }
            ]
          },
          select: {
            layanan: true,
            providerId: true,
            hargaPlatinum: true,
            subCategoryId: true,
            harga: true,
            hargaFlashSale: true,
            isFlashSale: true,
            id: true,
          },
          orderBy: {
            harga: "asc",
          },
        });
        return {
          layanan: data,
          subCategories,
        };
      } catch (error) {
        return {
          status: false,
          layanan: [],
          subCategories: [],
        };
      }
    }),
  getLayananByCategoryId: publicProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const category = await ctx.prisma.categories.findFirst({
          where: { id: parseInt(input.category) },
        });

        if (!category) {
          throw new Error("failed to create category");
        }

        const data = await ctx.prisma.layanan.findMany({
          where: {
            kategoriId: category?.id,
          },
          select: {
            layanan: true,
            providerId: true,
            subCategoryId: true,
            harga: true,
            id: true,
          },
          orderBy: {
            harga: "asc",
          },
        });
        return {
          layanan: data,
        };
      } catch (error) {
        return {
          error,
          status: false,
        };
      }
    }),
  edit: publicProcedure
    .input(layananFormSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$queryRaw`
      UPDATE layanans
      SET harga = ${input.harga},
          purchase_price = ${input.hargaBeli},
          harga_platinum = ${input.hargaPlatinum},
          status  = ${input.status === "active" ? 1 : 0},
          provider = ${input.provider}
      WHERE id = ${input.id}
      `;
      return {
        status: true,
        message: "layanan update successfully",
      };
    }),
  delete : publicProcedure
    .input(
      z.object({
        id : z.number()
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$queryRaw`
      DELETE  FROM layanans WHERE id = ${input.id}
      `
      return {
        status: true,
        message: "layanan update successfully",
      };
    }),
  
  flashsale: publicProcedure.query(async ({ ctx }) => {
    try {
      // First, fetch all flash sale items
      const layananItems = await ctx.prisma.layanan.findMany({
        where: {
          isFlashSale: true,
        },
      });

      // Get all the unique kategoriId values
      const categoryIds = Array.from(
        new Set(layananItems.map((item) => item.kategoriId))
      );

      // Fetch all related categories in one query
      const categories = await ctx.prisma.categories.findMany({
        where: {
          // Use 'in' operator to fetch multiple categories at once
          id: {
            in: categoryIds.map((id) => id),
          },
        },
      });

      const categoryMap = categories.reduce<
        Record<string, (typeof categories)[0]>
      >((acc, category) => {
        acc[category.id.toString()] = category;
        return acc;
      }, {});

      // Combine layanan items with their categories
      const data = layananItems.map((layanan) => ({
        ...layanan,
        category: categoryMap[layanan.kategoriId] || null,
      }));

      return data;
    } catch (error) {
      return {
        error,
        status: false,
      };
    }
  }),
});

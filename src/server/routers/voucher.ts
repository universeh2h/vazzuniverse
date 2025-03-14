import {
  createVoucherSchema,
  updateVoucherSchema,
} from '@/types/schema/voucher';
import { publicProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const voucher = router({
  getAll: publicProcedure
    .input(
      z.object({
        code: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.VoucherWhereInput = {};

        if (input.code) {
          where.code = { contains: input.code };
        }
        return await ctx.prisma.voucher.findMany({
          where,
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(error.message);
        }
        throw error;
      }
    }),
  create: publicProcedure
    .input(createVoucherSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const parsedInput = {
          ...input,
          startDate:
            input.startDate instanceof Date
              ? input.startDate
              : new Date(input.startDate),
          expiryDate:
            input.expiryDate instanceof Date
              ? input.expiryDate
              : new Date(input.expiryDate),
        };
        const {
          code,
          discountType,
          discountValue,
          expiryDate,
          isActive,
          isForAllCategories,
          startDate,
          categoryIds,
          description,
          maxDiscount,
          minPurchase,
          usageLimit,
        } = parsedInput;

        const data = await ctx.prisma.voucher.create({
          data: {
            code,
            discountType,
            discountValue,
            expiryDate,
            isActive,
            maxDiscount,
            description,
            startDate,
            isForAllCategories,
            usageLimit,
            minPurchase,
          },
        });

        if (categoryIds) {
          const categoryId = Promise.all(
            categoryIds.map(async (p) => {
              await ctx.prisma.voucherCategory.create({
                data: {
                  categoryId: p,
                  voucherId: data.id,
                },
              });
            })
          );

          return categoryId;
        }
        return data;
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(error.message);
        }
        console.log(error);
        throw error;
      }
    }),
  update: publicProcedure
    .input(updateVoucherSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.voucher.update({
          where: {
            id: input.id,
          },
          data: {
            ...input,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(error.message);
        }
        throw error;
      }
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.voucher.delete({
          where: {
            id: input.id,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(error.message);
        }
        throw error;
      }
    }),
});

import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { Prisma } from '@prisma/client';

export const Deposits = router({
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number(),
        perPage: z.number(),
        search: z.string(),
      })
    )
    .query(async ({ ctx }) => {
      try {
        const where: Prisma.DepositsWhereInput = {};
      } catch (error) {}
    }),
});

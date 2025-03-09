import { publicProcedure, router } from '../trpc';

export const methods = router({
  getMethods: publicProcedure.query(async ({ ctx }) => {
    try {
      const method = await ctx.prisma.methods.findMany();
      return {
        data: method,
        status: 200,
        message: 'Methods delivered success',
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      throw new Error('failed to fetch methods');
    }
  }),
});

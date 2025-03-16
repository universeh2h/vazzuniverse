import { publicProcedure, router } from '@/server/trpc';
import { configWeb } from '@/types/schema/config_web';
import { TRPCError } from '@trpc/server';

export const ConfigWeb = router({
  upsert: publicProcedure.input(configWeb).mutation(async ({ ctx, input }) => {
    try {
      // Check if a record exists
      const existingConfig = await ctx.prisma.websiteConfig.findFirst();

      if (existingConfig) {
        // If record exists, update it
        return ctx.prisma.websiteConfig.update({
          where: {
            id: existingConfig.id,
          },
          data: {
            ...input,
          },
        });
      } else {
        // If no record exists, create a new one
        return ctx.prisma.websiteConfig.create({
          data: {
            ...input,
          },
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        console.error(error.message);
      }
      throw error;
    }
  }),

  // Get the current config
  getConfig: publicProcedure.query(async ({ ctx }) => {
    try {
      const config = await ctx.prisma.websiteConfig.findFirst();
      if (!config) {
        return null; // Return null if no config exists yet
      }
      return config;
    } catch (error) {
      if (error instanceof TRPCError) {
        console.error(error.message);
      }
      throw error;
    }
  }),
});

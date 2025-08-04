import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { Prisma } from "@prisma/client";
export const tracking = router({
   getBalanceHistory: publicProcedure.input(
        z.object({
            search: z.string().optional(),
            limit: z.number().optional(),
            page: z.number().optional(),
            changeType: z.string().optional(),
        })
    ).query(async ({ input, ctx }) => {
        try {
            const { search, limit = 10, page = 1, changeType } = input;
            const skip = (page - 1) * limit;

            let whereConditions: any[] = [];
            
            if (search) {
                whereConditions.push(Prisma.sql`username = ${search}`);
            }

            if (changeType) {
                whereConditions.push(Prisma.sql`change_type = ${changeType}`);
            }

            const whereClause = whereConditions.length > 0 
                ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
                : Prisma.empty;

            // Count query
            const countResult = await ctx.prisma.$queryRaw<
                { total: bigint }[]
            >`
                SELECT COUNT(*) as total FROM balance_histories 
                ${whereClause}
            `;

            const result = await ctx.prisma.$queryRaw`
                SELECT * FROM balance_histories 
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${skip}
            `;

            const total = Number(countResult[0]?.total || 0);

            return {
                data: result,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error('Error fetching balance history:', error);
            throw new Error('Failed to fetch balance history');
        }
    }),
})
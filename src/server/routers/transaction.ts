import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { FormatPrice } from "@/utils/formatPrice";
import { Transaction } from "@/features/pages/dashboard/recent-transactions";
const getStartOfDayInWIB = () => {
  const now = new Date();
  const utcMillis = now.getTime();
  const startOfDay = new Date(utcMillis);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

const getStartOfMonthInWIB = () => {
  const now = new Date();
  const utcMillis = now.getTime();
  const startOfMonth = new Date(utcMillis);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
};

export const adminStats = publicProcedure.query(async ({ ctx }) => {
  try {
    // Get today and month start dates
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // SINGLE QUERY for revenue and profit calculations
    const [statsResult] = await ctx.prisma.$queryRaw<
      Array<{
        today_revenue: number;
        today_profit: number;
        month_revenue: number;
        month_profit: number;
        total_transactions: number;
        successful_transactions: number;
        pending_transactions: number;
        failed_transactions: number;
      }>
    >`
    SELECT 
      -- Today stats
      COALESCE(SUM(CASE WHEN status = 'SUCCESS' AND created_at >= ${startOfToday} THEN harga END), 0) as today_revenue,
      COALESCE(SUM(CASE WHEN status = 'SUCCESS' AND created_at >= ${startOfToday} 
        THEN ROUND(profit_amount) END), 0) as today_profit,
      
      -- This month stats  
      COALESCE(SUM(CASE WHEN status = 'SUCCESS' AND created_at >= ${startOfMonth} THEN harga END), 0) as month_revenue,
      COALESCE(SUM(CASE WHEN status = 'SUCCESS' AND created_at >= ${startOfMonth} 
        THEN ROUND(profit_amount) END), 0) as month_profit,
      
      -- Total counts by status
      COUNT(*) as total_transactions,
      COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_transactions,
      COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_transactions,
      COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_transactions
    FROM pembelians
  `;

    // Get recent transactions separately (with relations)
    const recentTransactions = (await ctx.prisma.$queryRaw`
  SELECT pembelian.order_id AS 'orderId',
    pembelian.username AS 'username',
    pembelian.layanan AS 'layanan',
    pembelian.harga AS 'hargaJual',
    pembelian.profit_amount AS 'profit',
    pembelian.purchase_price AS 'hargaBeli',
    pembelian.status AS 'status',
    pembelian.created_at AS 'createdAt',
    pembayaran.metode AS 'method',
    pembayaran.fee AS 'fee',
    pembayaran.no_pembeli AS 'noPembeli',
    pembayaran.status AS 'pembayaranStatus',
    pembelian.user_id AS 'userId',
    pembelian.zone AS 'zone',
    pembelian.nickname AS 'nickname'
  FROM pembelians AS pembelian
  LEFT JOIN pembayarans AS pembayaran ON pembelian.order_id = pembayaran.order_id
  ORDER BY pembelian.created_at DESC
  LIMIT 10
  `) as Transaction[];

    // Calculate percentages
    const totalTransactions = Number(statsResult.total_transactions);
    const successfulTransactions = Number(statsResult.successful_transactions);
    const failedTransactions = Number(statsResult.failed_transactions);

    const successPercentage =
      totalTransactions > 0
        ? ((successfulTransactions / totalTransactions) * 100).toFixed(2)
        : 0;
    const failedPercentage =
      totalTransactions > 0
        ? ((failedTransactions / totalTransactions) * 100).toFixed(2)
        : 0;

    return {
      totalTransactions,
      recentTransactions,
      statusCounts: {
        successful: successfulTransactions,
        pending: Number(statsResult.pending_transactions),
        failed: failedTransactions,
      },
      revenue: {
        today: FormatPrice(Number(statsResult.today_revenue)),
        thisMonthFormatted: Number(statsResult.month_revenue),
        thisMonth: FormatPrice(Number(statsResult.month_revenue)),
      },
      profit: {
        today: FormatPrice(Number(statsResult.today_profit)),
        thisMonth: FormatPrice(Number(statsResult.month_profit)),
      },
      percentages: {
        success: `${successPercentage}%`,
        failed: `${failedPercentage}%`,
      },
    };
  } catch (error) {
    console.log("errr", error);
    throw new Error("Failed to fetch admin statistics");
  }
});
export const PembelianAll = router({
  getId: publicProcedure
    .input(
      z.object({
        merchantOrderId: z.string().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { merchantOrderId } = input;

      // Periksa apakah merchantOrderId ada
      if (!merchantOrderId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Merchant Order ID is required",
        });
      }

      // Gunakan findUnique dengan kondisi yang spesifik
      const purchase = await ctx.prisma.pembelian.findUnique({
        where: {
          orderId: merchantOrderId,
        },
        include: {
          pembayaran: true,
        },
      });

      if (!purchase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction details not found",
        });
      }

      // Fetch layanan details jika diperlukan
      let layananDetails = null;
      if (purchase.layanan) {
        layananDetails = await ctx.prisma.layanan.findFirst({
          where: {
            layanan: purchase.layanan,
          },
        });
      }

      return {
        purchase,
        layananDetails,
      };
    }),
  getAll: publicProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      status: z.string().optional(),
      page: z.number().min(1).optional().default(1),
      limit: z.number().min(1).optional().default(10),
      searchTerm: z.string().optional().default(""),
      all: z.boolean().optional().default(false),
    })
  )
  .query(async ({ ctx, input }) => {
    try {
      const {
        status,
        page,
        limit,
        searchTerm,
        endDate,
        startDate,
        all,
      } = input;

      // Pagination
      const skip = (page - 1) * limit;

     const whereConditions: string[] = [];
const params: any[] = [];

// SearchTerm
if (searchTerm) {
  whereConditions.push(`(pembelian.order_id LIKE ? OR pembelian.username LIKE ? OR pembelian.user_id LIKE ?)`);
  const search = `%${searchTerm}%`;
  params.push(search, search, search);
}

// Status
if (status) {
  whereConditions.push(`pembelian.status = ?`);
  params.push(status);
}

// Start Date
if (startDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  whereConditions.push(`pembelian.created_at >= ?`);
  params.push(start);
}

// End Date
if (endDate) {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  whereConditions.push(`pembelian.created_at <= ?`);
  params.push(end);
}

const whereSQL = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

let limitSQL = "";
if (!all) {
  limitSQL = `LIMIT ? OFFSET ?`;
  params.push(limit, skip);
}

// Query data
const transactions = await ctx.prisma.$queryRawUnsafe<Transaction[]>(
  `
  SELECT pembelian.order_id AS orderId,
         pembelian.username AS username,
         pembelian.layanan AS layanan,
         pembelian.harga AS hargaJual,
         pembelian.profit_amount AS profit,
         pembelian.purchase_price AS hargaBeli,
         pembelian.status AS status,
         pembelian.created_at AS createdAt,
         pembayaran.metode AS method,
         pembayaran.fee AS fee,
         pembayaran.no_pembeli AS noPembeli,
         pembayaran.status AS pembayaranStatus,
         pembelian.user_id AS userId,
         pembelian.zone AS zone,
         pembelian.nickname AS nickname
  FROM pembelians AS pembelian
  LEFT JOIN pembayarans AS pembayaran ON pembelian.order_id = pembayaran.order_id
  ${whereSQL}
  ORDER BY pembelian.created_at DESC
  ${limitSQL}
  `,
  ...params
);

const totalCountResult = await ctx.prisma.$queryRawUnsafe<{ count: number }[]>(
  `
  SELECT COUNT(*) AS count
  FROM pembelians AS pembelian
  LEFT JOIN pembayarans AS pembayaran ON pembelian.order_id = pembayaran.order_id
  ${whereSQL}
  `,
  ...params.slice(0, params.length - (all ? 0 : 2))
);

const totalCount = Number(totalCountResult[0]?.count ?? 0);

return {
  transactions,
  totalCount,
pageCount: all ? 1 : Math.ceil(totalCount / limit),
  currentPage: all ? 1 : page,
};
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch pembelian data: ${error.message}`);
      }
      throw new Error("Failed to fetch pembelian data: Unknown error");
    }
  }),

  trackingInvoice: publicProcedure
    .input(
      z.object({
        invoice: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.pembayaran.findFirst({
          where: {
            orderId: input.invoice,
          },
          select: {
            orderId: true,
            noPembeli: true,
            status: true,
            updatedAt: true,
          },
        });
      } catch (error) {
        throw new Error("Invoice tidak ditemukan");
      }
    }),
  findMostPembelian: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.pembayaran.findMany({
      take: 10,
      select: {
        orderId: true,
        noPembeli: true,
        status: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  getAllPembelianData: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();

    // Today: Last 24 hours
    const last24Hours = new Date(now);
    last24Hours.setHours(now.getHours() - 24);

    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    const lastMonth = new Date(now);
    lastMonth.setDate(now.getDate() - 30);

    const aggregateAndSort = (transactions: any[]) => {
      const userTotals = new Map();

      transactions.forEach((tx) => {
        console.log(tx);
        const userKey = tx.username;

        if (!userKey) return;

        if (userTotals.has(userKey)) {
          const existingData = userTotals.get(userKey);
          userTotals.set(userKey, {
            username: tx.username || existingData.username,
            harga: existingData.harga + tx.harga,
          });
        } else {
          userTotals.set(userKey, {
            username: tx.username,
            harga: tx.harga,
          });
        }
      });

      return Array.from(userTotals.values())
        .sort((a, b) => b.harga - a.harga)
        .slice(0, 10); // Take top 10
    };

    // Common filter for successful transactions
    const commonFilter = {
      NOT: {
        AND: [{ username: "Guest" }, { nickname: "not-found" }],
      },
      status: {
        in: ["SUCCESS", "Success"],
      },
    };

    // Execute all queries in parallel for better performance
    const [todayTransactions, weekTransactions, monthTransactions] =
      await Promise.all([
        // Today's transactions (last 24 hours)
        ctx.prisma.pembelian.findMany({
          where: {
            createdAt: {
              gte: last24Hours,
              lte: now,
            },
            ...commonFilter,
          },
          select: {
            nickname: true,
            username: true,
            harga: true,
          },
        }),

        // This week's transactions (last 7 days)
        ctx.prisma.pembelian.findMany({
          where: {
            createdAt: {
              gte: lastWeek,
              lte: now,
            },
            ...commonFilter,
          },
          select: {
            nickname: true,
            username: true,
            harga: true,
          },
        }),

        // This month's transactions (last 30 days)
        ctx.prisma.pembelian.findMany({
          where: {
            createdAt: {
              gte: lastMonth,
              lte: now,
            },
            ...commonFilter,
          },
          select: {
            nickname: true,
            username: true,
            harga: true,
          },
        }),
      ]);

    // Aggregate and sort each time period's data
    const expensiveToday = aggregateAndSort(todayTransactions);
    const expensiveWeek = aggregateAndSort(weekTransactions);
    const expensiveMonth = aggregateAndSort(monthTransactions);

    // Return all data in a structured object
    return {
      expensive: {
        today: expensiveToday,
        week: expensiveWeek,
        month: expensiveMonth,
      },
    };
  }),
});

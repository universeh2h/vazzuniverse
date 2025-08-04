"use client";
import { CreditCard, DollarSign, ShoppingCart, Users } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionStatusChart } from "./transaction-status-chart";
import { RevenueChart } from "./revenue-chart";
import { trpc } from "@/utils/trpc";
import { RecentTransactions } from "./recent-transactions";
export type FILTER = "ALL" | "PAYMENT" | "DEPOSIT" | "Top Up";

export default function DashboardAdminPage() {
  const { data, isLoading } = trpc.transaction.useQuery();
  if (isLoading) {
    return (
      <main className="flex flex-col gap-6 p-6 bg-background">
        <div className="h-screen flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            className="text-lg text-primary"
          >
            Loading dashboard data...
          </motion.span>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex flex-col gap-6 p-6 bg-background">
        <div className="h-screen flex items-center justify-center">
          <span className="text-lg text-muted-foreground">No data available</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tight text-primary"
        >
          Dashboard
        </motion.h1>
      </div>

    
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.2 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            <Card className="border-primary hover:border-primary/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">
                  Total Transactions
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {data.totalTransactions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime transactions
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary hover:border-primary/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">
                  Total Revenue Bulan Ini
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {data.revenue.thisMonth}
                </div>
                <p className="text-xs text-muted-foreground">
                  Hari ini: {data.revenue.today}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary hover:border-primary/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">
                  Total Profit Bulan Ini
                </CardTitle>
                <CreditCard className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {data.profit.thisMonth}
                </div>
                <p className="text-xs text-muted-foreground">
                  Hari ini: {data.profit.today}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary hover:border-primary/80 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">
                  Success Rate
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {data.totalTransactions
                    ? Math.round(
                        (data.statusCounts.successful / data.totalTransactions) * 100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.statusCounts.successful} successful transactions
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts and Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
          >
            <Card className="col-span-4 border-primary hover:border-primary/80 transition-colors">
              <CardHeader>
                <CardTitle className="text-primary">Revenue Overview</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Monthly revenue for current period
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart
                  data={{
                    thisMonth: data.revenue.thisMonthFormatted,
                  }}
                />
              </CardContent>
            </Card>

            <Card className="col-span-3 border-primary hover:border-primary/80 transition-colors">
              <CardHeader>
                <CardTitle className="text-primary">
                  Transaction Status
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Distribution of transaction statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionStatusChart data={data} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <Card className="border-primary hover:border-primary/80 transition-colors">
            <CardHeader>
              <CardTitle className="text-primary">
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Most recent transaction activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentTransactions data={data.recentTransactions} />
            </CardContent>
          </Card>
        
    </main>
  );
}
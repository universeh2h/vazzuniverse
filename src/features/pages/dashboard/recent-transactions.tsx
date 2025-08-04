"use client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, FormatPrice } from "@/utils/formatPrice";

export interface Transaction {
  createdAt: string; // ISO string, bisa diubah ke Date jika akan diparse
  hargaBeli: number;
  hargaJual: number;
  layanan: string;
  method: string;
  fee: number;
  nickname: string;
  noPembeli: string;
  orderId: string;
  pembayaranStatus: "PAID" | "UNPAID" | "PENDING" | string;
  profit: number;
  status: "SUCCESS" | "FAILED" | "PENDING" | string;
  userId: string;
  username: string;
  zone: string;
}

interface RecentTransactionsProps {
  data: Transaction[] | undefined;
}

export function RecentTransactions({ data }: RecentTransactionsProps) {
  if (!data?.length) {
    return (
      <div className="h-[200px] flex items-center justify-center border rounded-md">
        <p className="text-muted-foreground">No transactions available</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>No. Tujuan</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Harga Beli</TableHead>
          <TableHead>Harga Jual</TableHead>
          <TableHead>Profit</TableHead>
          <TableHead>Fee</TableHead>

          <TableHead className="text-center">No. Pembeli</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Status Pesanan</TableHead>
          <TableHead>Status Pembayaran</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => (
          <TableRow key={transaction.orderId}>
            <TableCell className="font-medium">{transaction.orderId}</TableCell>
            <TableCell>{transaction.username || "Anonymous"}</TableCell>
            <TableCell>
              {transaction.zone
                ? `${transaction.userId}-${transaction.zone}`
                : `${transaction.userId}`}
            </TableCell>
            <TableCell>{transaction.layanan}</TableCell>
            <TableCell>{FormatPrice(transaction.hargaBeli ?? 0)}</TableCell>
            <TableCell>{FormatPrice(transaction.hargaJual ?? 0)}</TableCell>
            <TableCell>{FormatPrice(transaction.profit ?? 0)}</TableCell>
            <TableCell>{FormatPrice(transaction.fee ?? 0)}</TableCell>

            <TableCell className="text-center">
              {transaction.noPembeli}
            </TableCell>
            <TableCell>{transaction.method || "N/A"}</TableCell>
            <TableCell className="text-center">
              <Badge
                variant={
                  transaction.status === "SUCCESS"
                    ? "secondary"
                    : transaction.status === "PENDING"
                    ? "default"
                    : "destructive"
                }
              >
                {transaction.status}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              <Badge
                variant={
                  transaction.pembayaranStatus === "PAID"
                    ? "secondary"
                    : transaction.pembayaranStatus === "PENDING"
                    ? "default"
                    : "destructive"
                }
              >
                {transaction.pembayaranStatus as string}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {formatDate(transaction.createdAt as string)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

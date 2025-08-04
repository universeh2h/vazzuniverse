"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { formatDate, FormatPrice } from "@/utils/formatPrice";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { PaginationComponent } from "@/components/ui/pagination-component";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DebouncedSearch } from "@/components/ui/debouncedSearch";
import { DATA_LIMIT } from "@/data/data-limit";

type BalanceHistoryItem = {
  username: string;
  change_type: string;
  balance_change: number;
  balance_before: number;
  balance_after: number;
  description_detail: string;
  created_at: string;
};

const getBadgeVariant = (changeType: string) => {
  const variants: {
    [key: string]: "default" | "secondary" | "destructive" | "outline";
  } = {
    DEPOSIT: "default",
    USAGE: "destructive",
    REFUND: "secondary",
    ADJUSTMENT: "outline",
  };
  return variants[changeType] || "outline";
};

export default function TrackingPage() {
  const [term, setTerm] = useState("");
  const [changeType, setChageType] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState<number>(10);
  const { data, isLoading, error } = trpc.tracking.getBalanceHistory.useQuery({
    search: term,
    changeType,
    limit,
    page: currentPage,
  });

  const pagination = data?.pagination
    ? {
        totalCount: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasNextPage: currentPage < data.pagination.totalPages,
        hasPreviousPage: currentPage > 1,
      }
    : {
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

  if (error) {
    return (
      <main className="p-7">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <FileText className="h-4 w-4" />
              <p>Error loading data: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-7 flex flex-col gap-6">
      {/* Search Header */}

      <div className="flex justify-between w-full gap-4">
        <DebouncedSearch
          setTerm={setTerm}
          term={term}
          delay={900}
          className="w-full"
        />

        <DropdownMenu>
          <DropdownMenuTrigger className="w-full max-w-40 bg-card rounded-md active:border-none">
            Select Choices
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setChageType("USAGE")}>
              Pengguaan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setChageType("DEPOSIT")}>
              Deposit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setChageType("REFUND")}>
              Refund
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="w-full max-w-40 bg-card rounded-md active:border-none">
            Select Limit
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {DATA_LIMIT.map((item, idx) => (
              <DropdownMenuItem key={idx} onClick={() => setLimit(item)}>
                {item}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Perubahan</TableHead>
                <TableHead>Saldo Sebelum</TableHead>
                <TableHead>Saldo Sesudah</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data as BalanceHistoryItem[])?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-12 w-12" />
                      <p>Tidak ada data riwayat saldo</p>
                      {term && (
                        <p className="text-sm">untuk pencarian "{term}"</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                (data?.data as BalanceHistoryItem[])?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.username}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(item.change_type)}>
                        {item.change_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`font-medium ${
                          item.balance_change >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.balance_change >= 0 ? "+" : ""}
                        {FormatPrice(item.balance_change)}
                      </div>
                    </TableCell>
                    <TableCell>{FormatPrice(item.balance_before)}</TableCell>
                    <TableCell>{FormatPrice(item.balance_after)}</TableCell>
                    <TableCell>
                      <div
                        className="max-w-xs truncate"
                        title={item.description_detail}
                      >
                        {item.description_detail}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.created_at, "date-only")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <PaginationComponent
          currentPage={currentPage}
          perPage={limit}
          pagination={pagination}
          setCurrentPage={setCurrentPage}
        />
      )}
    </main>
  );
}

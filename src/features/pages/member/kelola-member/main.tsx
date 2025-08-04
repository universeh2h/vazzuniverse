"use client";

import { trpc } from "@/utils/trpc";
import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Ellipsis,
  Search,
  UserCircle,
} from "lucide-react";
import { formatDate } from "@/utils/formatPrice";
import DropdownMember from "./components/button-member";
import { PaginationSection } from "../../dashboard/dashboard-pesanan/pagination-section";

export function ManageMember() {
  const [page, setPage] = useState<number>(1);
  const perPage = 10;
  const [filter, setFilter] = useState<string>("");

  const { data: membersData, isLoading } = trpc.member.findAll.useQuery({
    page,
    perPage,
    filter,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

    const handlePageChange = (page: number) => {
    setPage(page);
  };
  return (
    <main className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Members
        {membersData ? <p>Total Saldo Member : 
           {membersData.totalBalanceUser}</p> : null}
        </h1>
        <div className="flex space-x-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search members..."
              className="w-64"
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Members Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>balance</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : membersData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              membersData?.data.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                    {member.name}
                  </TableCell>
                  <TableCell>{member.username}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.balance}</TableCell>
                  <TableCell>
                    {formatDate(member.createdAt as string)}
                  </TableCell>
                  <TableCell>
                    <DropdownMember user={member}>
                      <Button className="rounded-full size-6 bg-transparent text-white">
                        <Ellipsis />
                      </Button>
                    </DropdownMember>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {
        membersData && (
          <PaginationSection currentPage={membersData?.meta.page} onPageChange={handlePageChange} totalPages={membersData?.meta.pageCount}/>
        )
      }
    </main>
  );
}

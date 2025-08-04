"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { HeaderLayanan } from "../../components/headerlayanan";
import { LayananTable } from "./layanan-table";
import { PaginationSection } from "../dashboard-pesanan/pagination-section";

export function LayananPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [status, setStatus] = useState<boolean | undefined>(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const { data } = trpc.layanans.getAll.useQuery(
    {
      page: currentPage,
      limit: perPage,
      search: searchTerm,
      status: status ? "active" : "inactive",
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      cacheTime: 5 * 60 * 1000,
      staleTime: 5 * 60 * 1000,
      refetchOnReconnect: false,
      enabled: true,
    }
  );
  const totalPages = data?.pagination.totalPages;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen p-8">
      <HeaderLayanan
        term={searchTerm}
        setTerm={setSearchTerm}
        status={status}
        perPage={perPage}
        setPerPage={setPerPage}
        setStatus={setStatus}
      />

      {data && <LayananTable data={data.data} />}
      <PaginationSection
        currentPage={currentPage}
        totalPages={totalPages ?? 0}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

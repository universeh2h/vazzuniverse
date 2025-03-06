"use client";
import { Trpc, trpcClient } from "@/utils/trpc"; // Fix: Use lowercase `trpc`
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode, useState } from "react";

export default function TRPCProvider({ children }: { children: ReactNode }) {
  // Fix: Create a new QueryClient instance
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Trpc.Provider>
  );
}

import { AppRouter } from "@/server/trpc";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

export const Trpc = createTRPCReact<AppRouter>();

export const trpcClient = Trpc.createClient({
  links: [
    httpBatchLink({
        url: "/api/trpc",
        transformer : superjson,
    }),
    ],
    
});

import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const t = initTRPC.create({
    transformer: superjson,
    // errorFormatter(opts) {
    //     return opts.shape
    // }
})


export const appRouter = t.router({
    hello: t.procedure.query(() => {
        return { message : "hellow from trpc !"}
    }),
    
})
export type AppRouter = typeof appRouter;

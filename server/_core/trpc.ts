import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getAdminSessionToken, verifyAdminSession } from "../adminPassword";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const passwordAdminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const session = getAdminSessionToken(opts.ctx.req.headers);
    if (!(await verifyAdminSession(session))) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Editing mode has expired. Sign in again to continue." });
    }
    return opts.next({ ctx: opts.ctx });
  }),
);

import { describe, expect, it } from "vitest";
import { defaultPortfolioContent } from "../shared/portfolio";
import { createAdminSession } from "./adminPassword";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(sessionToken?: string): TrpcContext {
  return { req: { headers: sessionToken ? { "x-admin-session": sessionToken } : {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("password-protected portfolio routes", () => {
  it("rejects direct content writes without a server-verified admin session", async () => {
    await expect(appRouter.createCaller(context()).portfolio.saveContent(defaultPortfolioContent)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("accepts a password-issued session on the server", async () => {
    const sessionToken = await createAdminSession();
    await expect(appRouter.createCaller(context(sessionToken)).admin.status()).resolves.toEqual({ editing: true });
  });
});

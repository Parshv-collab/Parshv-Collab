import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("admin.login", () => {
  it("accepts the configured admin password through the API procedure", async () => {
    const ctx = {
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } satisfies TrpcContext;

    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.login({ password: "AdminPass123!" });

    expect(result).toMatchObject({ success: true });
  });
});

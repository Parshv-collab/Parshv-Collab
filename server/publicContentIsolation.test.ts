import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("public content request isolation", () => {
  it("uses individual RPC requests so the essential portfolio payload is not blocked by slower auxiliary activity data", () => {
    const mainSource = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
    expect(mainSource).toContain('import { httpLink } from "@trpc/client"');
    expect(mainSource).toContain("httpLink({");
    expect(mainSource).not.toContain("httpBatchLink(");
  });
});

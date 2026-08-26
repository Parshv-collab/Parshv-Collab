import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const notFoundSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/NotFound.tsx"), "utf8");

describe("not-found route", () => {
  it("uses the portfolio's dark-first recovery surface rather than the removed template's light fallback", () => {
    expect(notFoundSource).toContain('bg-[#09090b]');
    expect(notFoundSource).toContain('text-[#b4ff4a]');
    expect(notFoundSource).not.toContain("from-slate-50");
    expect(notFoundSource).not.toContain("bg-white/80");
  });
});

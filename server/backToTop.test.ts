import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(import.meta.dirname, "../client/src/components/BackToTop.tsx"), "utf8");

describe("Back to Top control", () => {
  it("appears only after a scroll threshold and selects an appropriate motion behavior", () => {
    expect(source).toContain("window.scrollY > threshold");
    expect(source).toContain('behavior: shouldReduceMotion ? "auto" : "smooth"');
    expect(source).toContain('aria-label="Back to top"');
    expect(source).toContain("safe-area-inset-bottom");
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const indicatorSource = readFileSync(resolve(import.meta.dirname, "../client/src/components/SectionTransitionIndicator.tsx"), "utf8");
const homeSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");

describe("section transition signal", () => {
  it("uses a brief loading state, supports reduced motion, and is wired to public section navigation", () => {
    expect(indicatorSource).toContain("useReducedMotion");
    expect(indicatorSource).toContain("Loading {sectionLabels[destination]}");
    expect(indicatorSource).toContain("window.setTimeout");
    expect(homeSource).toContain("<SectionTransitionIndicator />");
    expect(homeSource).toContain("requestSectionTransition");
  });
});

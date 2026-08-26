import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const styles = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");

describe("mobile portfolio responsive contract", () => {
  it("keeps compact project previews and project actions wired to the mobile card styles", () => {
    expect(homeSource).not.toContain("work-filter-strip");
    expect(homeSource).toContain("project-card-actions--single");
    expect(homeSource).toContain("min-h-12 bg-[var(--portfolio-accent)]");
    expect(homeSource).toContain("<BackToTop />");
    expect(homeSource).toContain("pt-[env(safe-area-inset-top)]");
    expect(homeSource).toContain("min-h-12 items-center rounded-xl px-3");
    expect(homeSource).toContain("pb-[max(1.25rem,env(safe-area-inset-bottom))]");
    expect(styles).toContain("@media (hover: none), (pointer: coarse)");
    expect(styles).toContain(".project-signal-reveal { padding: 1rem; opacity: 1;");
    expect(styles).toContain(".project-card-actions--single > * { grid-column: 1 / -1; }");
  });
});
